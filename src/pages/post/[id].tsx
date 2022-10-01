import React, { useState } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import {
  Comment,
  CreateCommentInput,
  CreateCommentMutation,
  GetPostQuery,
  ListPostsQuery,
  Post,
} from "../../API";
import { API, withSSRContext } from "aws-amplify";
import { getPost, listPosts } from "../../graphql/queries";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import AddCommentIcon from "@mui/icons-material/AddComment";
import PostPreview from "../../components/PostPreview";
import { SubmitHandler, useForm } from "react-hook-form";
import { createComment } from "../../graphql/mutations";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/auth";
import PostComment from "../../components/PostComment";

interface IFormInput {
  comment: string;
}

interface Props {
  post: Post;
}

export default function SinglePost({ post }: Props) {
  const [comments, setComments] = useState<Comment[]>(
    post.comments.items as Comment[]
  );
  const [loading, setLoading] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);
    const newCommentInput: CreateCommentInput = {
      postID: post.id,
      content: data.comment,
    };
    const createNewComment = (await API.graphql({
      query: createComment,
      variables: { input: newCommentInput },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    })) as { data: CreateCommentMutation };
    setLoading(false);
    setComments([...comments, createNewComment.data.createComment as Comment]);
  };

  return (
    <Container maxWidth="md">
      <PostPreview post={post} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        style={{ marginTop: 32, marginBottom: 4 }}
      >
        <Grid container columnSpacing={2} direction="row" alignItems="center">
          <Grid sx={{ flexGrow: 1 }}>
            <TextField
              variant="outlined"
              id="comment"
              label="Add A Comment"
              type="text"
              multiline
              fullWidth
              error={errors.comment ? true : false}
              helperText={errors.comment ? errors.comment.message : null}
              {...register("comment", {
                required: { value: true, message: "Please enter a comment." },
                maxLength: {
                  value: 240,
                  message: "Please enter a comment under 240 characters.",
                },
              })}
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid>
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              startIcon={<AddCommentIcon fontSize="small" />}
              variant="contained"
              type="submit"
            >
              {loading ? "Publishing comment ..." : "Add comment"}
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
      {comments
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((comment) => (
          <PostComment key={comment.id} comment={comment} />
        ))}
    </Container>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const SSR = withSSRContext();
  const postsQuery = (await SSR.API.graphql({
    query: getPost,
    variables: {
      id: params.id,
    },
  })) as { data: GetPostQuery };
  return {
    props: {
      post: postsQuery.data.getPost as Post,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const SSR = withSSRContext();
  const response = (await SSR.API.graphql({ query: listPosts })) as {
    data: ListPostsQuery;
    errors: any[];
  };
  const paths = response.data.listPosts.items.map((post) => ({
    params: { id: post.id },
  }));
  return { paths, fallback: "blocking" };
};
