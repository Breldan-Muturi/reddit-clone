import React, { ReactElement, useState } from "react";
import Container from "@mui/material/Container";
import LoadingButton from "@mui/lab/LoadingButton";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Unstable_Grid2";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from "react-hook-form";
import { API, Storage } from "aws-amplify";
import { createPost } from "../graphql/mutations";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/auth";
import { CreatePostInput, CreatePostMutation } from "../API";
import ImageDropzone from "../components/ImageDropzone";
import { uuid } from "uuidv4";

interface IFormInput {
  title: string;
  content: string;
}

export default function create(): ReactElement {
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState<Boolean>(false);
  const isLoading = Boolean(loading);
  const router = useRouter();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);
    if (file) {
      //Send a request to upload to S3 Bucket
      try {
        const imagePath = uuid();
        await Storage.put(imagePath, file, {
          contentType: file.type,
        });
        const createNewPostInput: CreatePostInput = {
          title: data.title,
          contents: data.content,
          image: imagePath,
        };
        const createNewPost = (await API.graphql({
          query: createPost,
          variables: { input: createNewPostInput },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        })) as { data: CreatePostMutation };
        router.push(`/post/${createNewPost.data.createPost.id}`);
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setLoading(false);
      }
    } else {
      const createNewPostWithoutImageInput: CreatePostInput = {
        title: data.title,
        contents: data.content,
      };

      const createNewPostWithoutImage = (await API.graphql({
        query: createPost,
        variables: { input: createNewPostWithoutImageInput },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as { data: CreatePostMutation };
      setLoading(false);
      router.push(`/post/${createNewPostWithoutImage.data.createPost.id}`);
    }
  };
  return (
    <Container maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Grid container direction="column" rowSpacing={4}>
          <Grid>
            <TextField
              variant="outlined"
              id="title"
              label="Post Title"
              type="text"
              fullWidth
              error={errors.title ? true : false}
              helperText={errors.title ? errors.title.message : null}
              {...register("title", {
                required: { value: true, message: "Please enter a title." },
                maxLength: {
                  value: 120,
                  message:
                    "Please enter a title that is 120 characters or less.",
                },
              })}
            />
          </Grid>
          <Grid>
            <TextField
              variant="outlined"
              id="content"
              label="Post Content"
              type="text"
              fullWidth
              multiline
              minRows={4}
              error={errors.content ? true : false}
              helperText={errors.content ? errors.content.message : null}
              {...register("content", {
                required: {
                  value: true,
                  message: "Please enter some content for your post.",
                },
                maxLength: {
                  value: 1000,
                  message:
                    "Please make sure your content is 1000 characters or less.",
                },
              })}
            />
          </Grid>
          <Grid>
            <ImageDropzone file={file} setFile={setFile} />
          </Grid>
          <LoadingButton
            loading={isLoading}
            loadingPosition="start"
            startIcon={<AddIcon fontSize="small" />}
            variant="contained"
            type="submit"
          >
            {loading ? "Publishing post ..." : "Create Post"}
          </LoadingButton>
        </Grid>
      </form>
    </Container>
  );
}
