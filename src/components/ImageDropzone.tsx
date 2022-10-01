import { Dispatch, SetStateAction } from "react";
import { useDropzone } from "react-dropzone";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ClearIcon from "@mui/icons-material/Clear";

interface Props {
  file: File;
  setFile: Dispatch<SetStateAction<File>>;
}

export default function ImageDropzone({ file, setFile }: Props) {
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  return (
    <>
      {file ? (
        <Grid
          container
          alignItems="flex-start"
          justifyContent="center"
          direction="column"
          rowSpacing={1}
        >
          <Grid
            container
            xs={12}
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
          >
            <Grid>
              <Typography variant="h6">Your Image:</Typography>
            </Grid>
            <Grid>
              <Button
                color="error"
                size="small"
                startIcon={<ClearIcon fontSize="small" />}
                onClick={() => setFile(null)}
              >
                Remove Photo
              </Button>
            </Grid>
          </Grid>
          <Grid>
            <img
              src={URL.createObjectURL(file)}
              style={{ width: "auto", maxHeight: 320 }}
            />
          </Grid>
        </Grid>
      ) : (
        <section
          className="container"
          style={{
            borderStyle: "dashed",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.5)",
            minHeight: 128,
          }}
        >
          <div
            {...getRootProps({ className: "dropzone" })}
            style={{ padding: 16 }}
          >
            <input accept="image/*" {...getInputProps()} />
            <Typography variant="body1">
              Drag and drop the image you want to upload for your post.
            </Typography>
          </div>
        </section>
      )}
    </>
  );
}
