import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Unstable_Grid2";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import formatDatePosted from "../lib/formatDatePosted";
import {
  CreateVoteInput,
  CreateVoteMutation,
  Post,
  UpdateVoteInput,
  UpdateVoteMutation,
} from "../API";
import Image from "next/image";
import { useRouter } from "next/router";
import { API, Storage } from "aws-amplify";
import { useUser } from "../context/AuthContext";
import { createVote, updateVote } from "../graphql/mutations";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/auth";

interface Props {
  post: Post;
}

export default function PostPreview({ post }: Props) {
  const { user } = useUser();
  const router = useRouter();
  const [postImage, setPostImage] = useState<string | undefined>(undefined);
  const [existingVote, setExistingVote] = useState<string | undefined>(
    undefined
  );
  const [existingVoteId, setExistingVoteId] = useState<string | undefined>(
    undefined
  );
  const [upvotes, setUpvotes] = useState<number>(
    post.votes.items
      ? post.votes.items.filter((v) => v.vote === "upvote").length
      : 0
  );

  const [downvotes, setDownvotes] = useState(
    post.votes.items
      ? post.votes.items.filter((v) => v.vote === "downvote").length
      : 0
  );

  useEffect(() => {
    if (user) {
      const tryFindVote = post.votes.items?.find(
        (v) => v.owner === user.getUsername()
      );
      if (tryFindVote) {
        setExistingVote(tryFindVote.vote);
        setExistingVoteId(tryFindVote.id);
      }
    }
  }, [user]);

  useEffect(() => {
    async function getImageFromStorage() {
      try {
        const signedURL = await Storage.get(post.image);
        setPostImage(signedURL);
      } catch (error) {
        console.log("No Image Found");
      }
    }
    getImageFromStorage();
  }, []);

  const addVote = async (voteType: string) => {
    if (existingVote && existingVote !== voteType) {
      const updateVoteInput: UpdateVoteInput = {
        id: existingVoteId,
        vote: voteType,
        postID: post.id,
      };
      const updateThisVote = (await API.graphql({
        query: updateVote,
        variables: { input: updateVoteInput },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as { data: UpdateVoteMutation };
      if (voteType === "upvote") {
        setUpvotes((prevState) => prevState + 1);
        setDownvotes((prevState) => prevState - 1);
      }
      if (voteType === "downvote") {
        setUpvotes((prevState) => prevState - 1);
        setDownvotes((prevState) => prevState + 1);
      }
      setExistingVote(voteType);
      setExistingVoteId(updateThisVote.data.updateVote.id);
    }

    if (!existingVote) {
      const createNewVoteInput: CreateVoteInput = {
        vote: voteType,
        postID: post.id,
      };
      const createNewVote = (await API.graphql({
        query: createVote,
        variables: { input: createNewVoteInput },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as { data: CreateVoteMutation };
      if (createNewVote.data.createVote.vote === "upvote") {
        setUpvotes((prevState) => prevState + 1);
      }
      if (createNewVote.data.createVote.vote === "downvote") {
        setDownvotes((prevState) => prevState + 1);
      }
      setExistingVote(voteType);
      setExistingVoteId(createNewVote.data.createVote.id);
    }
  };

  return (
    <Paper elevation={3}>
      <Grid
        container
        xs={12}
        p={{ xs: 0.5, md: 2 }}
        mt={3}
        width="100%"
        direction="row"
        wrap="nowrap"
        columnSpacing={{ xs: 4, md: 3 }}
        justifyContent="flex-start"
      >
        <Grid
          container
          direction="column"
          alignItems="center"
          rowSpacing={1}
          xs={2}
          md={1}
        >
          <Grid>
            <IconButton color="inherit" onClick={() => addVote("upvote")}>
              {existingVote === "upvote" ? (
                <ThumbUpAltIcon fontSize="small" color="secondary" />
              ) : (
                <ThumbUpOffAltIcon fontSize="small" />
              )}
            </IconButton>
          </Grid>
          <Grid>
            <Typography variant="h6">{upvotes - downvotes}</Typography>
          </Grid>
          <Grid>
            <Typography variant="body2">votes</Typography>
          </Grid>
          <Grid>
            <IconButton color="inherit" onClick={() => addVote("downvote")}>
              {existingVote === "downvote" ? (
                <ThumbDownAltIcon fontSize="small" color="secondary" />
              ) : (
                <ThumbDownOffAltIcon fontSize="small" />
              )}
            </IconButton>
          </Grid>
        </Grid>
        <ButtonBase
          sx={{ width: "100%" }}
          onClick={() => router.push(`/post/${post.id}`)}
        >
          <Grid
            xs={10}
            md={11}
            container
            direction="column"
            alignItems="flex-start"
          >
            <Grid>
              <Typography variant="body1" align="left" sx={{ lineHeight: 1 }}>
                Posted by <b>{post.owner}</b> {formatDatePosted(post.createdAt)}{" "}
                hours ago
              </Typography>
            </Grid>
            <Grid>
              <Typography
                variant="h2"
                align="left"
                sx={{ lineHeight: 1.25, paddingY: 2 }}
              >
                {post.title}
              </Typography>
            </Grid>
            <Grid>
              <Typography
                variant="body1"
                align="left"
                sx={{ lineHeight: 1.25, paddingBottom: 2 }}
              >
                {post.contents.substring(0, 120)}
                {post.contents.length > 240 && "..."}
              </Typography>
            </Grid>
            {post.image && postImage && (
              <Grid>
                <Image
                  src={postImage}
                  height={540}
                  width={980}
                  layout="intrinsic"
                />
              </Grid>
            )}
          </Grid>
        </ButtonBase>
      </Grid>
    </Paper>
  );
}
