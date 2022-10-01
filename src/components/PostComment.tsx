import React from "react";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { Comment } from "../API";
import formatDatePosted from "../lib/formatDatePosted";

interface Props {
  comment: Comment;
}

export default function PostComment({ comment }: Props) {
  return (
    <Paper sx={{ width: "100%", minHeight: 16, padding: 2, marginTop: 4 }}>
      <Grid container rowSpacing={1} direction="column">
        <Grid>
          <Typography variant="body1">
            <b>{comment.owner}</b> - {formatDatePosted(comment.createdAt)} hours
            ago
          </Typography>
        </Grid>
        <Grid>
          <Typography variant="body2">{comment.content}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
