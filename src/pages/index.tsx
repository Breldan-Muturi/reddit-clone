import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { API } from "aws-amplify";
import useSWR from "swr";
import { ListPostsQuery, Post } from "../API";
import PostPreview from "../components/PostPreview";
import { useUser } from "../context/AuthContext";
import { listPosts } from "../graphql/queries";
import { ReactFragment } from "react";

const fetcher = async () => {
  const allPosts = (await API.graphql({ query: listPosts })) as {
    data: ListPostsQuery;
    errors: any[];
  };
  if (allPosts.data) {
    return allPosts.data.listPosts.items as Post[];
  } else {
    throw new Error("Could not get posts");
  }
};

export default function Home() {
  const { user } = useUser();
  const { data: posts, error } = useSWR("listPosts", fetcher);

  let content: JSX.Element | JSX.Element[] | ReactFragment;

  if (!posts) {
    content = (
      <Stack
        direction="row"
        spacing={2}
        p={4}
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress color="secondary" />
        <Typography variant="body1">Loading recent posts...</Typography>
      </Stack>
    );
  } else {
    content = posts.map((post) => <PostPreview key={post.id} post={post} />);
  }

  return <Container maxWidth="md">{content}</Container>;
}
