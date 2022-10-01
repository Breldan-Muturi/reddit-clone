import { useForm, SubmitHandler } from "react-hook-form";
import { Auth } from "aws-amplify";
import { CognitoUser } from "@aws-amplify/auth";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Unstable_Grid2";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircle from "@mui/icons-material/AccountCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockResetIcon from "@mui/icons-material/LockReset";
import Link from "@mui/material/Link";
import { useState } from "react";
import { useUser } from "../context/AuthContext";
import { useRouter } from "next/router";

interface IFormInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}

export default function Signup() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<Boolean>(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [authMode, setAuthMode] = useState<string>("login");

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  console.log(errors);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);
    if (authMode === "login") {
      try {
        await Auth.signIn(data.username, data.password);
        router.push("/");
      } catch (err) {
        setAuthError(err.message);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }

    if (authMode === "register") {
      try {
        signUpWithEmailAndPassword(data);
        setAuthMode("verify");
      } catch (err) {
        setAuthError(err.message);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }
    if (authMode === "verify") {
      try {
        confirmSignUp(data);
      } catch (err) {
        setAuthError(err.message);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  async function signUpWithEmailAndPassword(
    data: IFormInput
  ): Promise<CognitoUser> {
    const { username, password, email } = data;
    setLoading(true);
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email,
        },
      });
      setLoading(false);
      return user;
    } catch (error) {
      setLoading(false);
      setAuthError(error);
      setOpen(true);
      throw error;
    }
  }

  async function confirmSignUp(data: IFormInput) {
    const { username, password, code } = data;
    setLoading(true);
    try {
      await Auth.confirmSignUp(username, code);
      const amplifyUser = await Auth.signIn(username, password);
      if (amplifyUser) {
        router.push("/");
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error("Something went wrong signing in");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error signing up:", error);
    }
  }

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: "url(https://source.unsplash.com/random)",
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Create an Account
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
            {authMode !== "verify" && (
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="username"
                label="Username"
                autoFocus
                autoComplete="username"
                type="text"
                error={errors.username ? true : false}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <AccountCircle color="secondary" />
                    </InputAdornment>
                  ),
                }}
                helperText={errors.username ? errors.username.message : null}
                {...register("username", {
                  required: {
                    value: true,
                    message: "Please enter a username.",
                  },
                  minLength: {
                    value: 3,
                    message: "Please enter a username between 3-16 characters.",
                  },
                  maxLength: {
                    value: 16,
                    message: "Please enter a username between 3-16 characters.",
                  },
                })}
              />
            )}
            {authMode === "register" && (
              <TextField
                variant="outlined"
                margin="normal"
                id="email"
                fullWidth
                autoComplete="email"
                label="Email"
                type="email"
                error={errors.email ? true : false}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EmailIcon color="secondary" />
                    </InputAdornment>
                  ),
                }}
                helperText={errors.email ? errors.email.message : null}
                {...register("email", {
                  required: {
                    value: true,
                    message: "Please enter a valid email.",
                  },
                })}
              />
            )}
            {(authMode === "login" || authMode === "register") && (
              <TextField
                variant="outlined"
                id="password"
                margin="normal"
                fullWidth
                label="Password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                error={errors.password ? true : false}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      onClick={() => setShowPassword((prevState) => !prevState)}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon cursor="pointer" color="secondary" />
                      ) : (
                        <VisibilityIcon cursor="pointer" color="secondary" />
                      )}
                    </InputAdornment>
                  ),
                }}
                helperText={errors.password ? errors.password.message : null}
                {...register("password", {
                  required: {
                    value: true,
                    message: "Please enter a password.",
                  },
                  minLength: {
                    value: 8,
                    message: "Please enter a stronger password.",
                  },
                })}
              />
            )}
            {authMode === "register" && (
              <TextField
                variant="outlined"
                id="confirmPassword"
                margin="normal"
                fullWidth
                label="Confirm Password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                error={errors.confirmPassword ? true : false}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      onClick={() => setShowPassword((prevState) => !prevState)}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon cursor="pointer" color="secondary" />
                      ) : (
                        <VisibilityIcon cursor="pointer" color="secondary" />
                      )}
                    </InputAdornment>
                  ),
                }}
                helperText={
                  errors.confirmPassword ? errors.confirmPassword.message : null
                }
                {...register("confirmPassword", {
                  required: {
                    value: true,
                    message: "Please enter a password.",
                  },
                  minLength: {
                    value: 8,
                    message: "Please enter a stronger password.",
                  },
                })}
              />
            )}
            {authMode === "verify" && (
              <TextField
                variant="outlined"
                id="code"
                margin="normal"
                fullWidth
                label="Verification Code"
                type="text"
                error={errors.code ? true : false}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <AccountCircle color="secondary" />
                    </InputAdornment>
                  ),
                }}
                helperText={
                  errors.code
                    ? errors.code.message
                    : "Enter the verification code sent to your email."
                }
                {...register("code", {
                  required: {
                    value: true,
                    message: "Adding a valid code is required.",
                  },
                  minLength: {
                    value: 6,
                    message: "Your verification should be 6 characters long.",
                  },
                  maxLength: {
                    value: 6,
                    message: "Your verification should be 6 characters long.",
                  },
                })}
              />
            )}
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              startIcon={
                (authMode === "login" && <LockOutlinedIcon />) ||
                (authMode === "register" && <PersonAddIcon />) ||
                (authMode === "verify" && <AdminPanelSettingsIcon />) ||
                (authMode === "reset" && <LockResetIcon />)
              }
              sx={{ mt: 3, mb: 2 }}
              fullWidth
              variant="contained"
              type="submit"
            >
              {authMode === "verify" &&
                (loading
                  ? "Confirming your account..."
                  : "Confirm your Account")}
              {authMode === "login" &&
                (loading
                  ? "Logging into your account..."
                  : "Login To Your Account")}
              {authMode === "register" &&
                (loading ? "Creating Your Account..." : "Create An Account")}
              {authMode === "reset" &&
                (loading
                  ? "Resetting Your Password..."
                  : "Reset Your Password")}
            </LoadingButton>
            <Grid container>
              <Grid xs>
                <Link
                  href="#"
                  variant="body2"
                  onClick={() => setAuthMode("reset")}
                >
                  Forgot password?
                </Link>
              </Grid>
              <Grid>
                <Link
                  href="#"
                  onClick={() =>
                    setAuthMode(authMode === "register" ? "login" : "register")
                  }
                  variant="body2"
                >
                  {authMode === "register"
                    ? "Already have an account? Log in"
                    : "Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert onClose={handleClose} severity="error">
                {authError}
              </Alert>
            </Snackbar>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
