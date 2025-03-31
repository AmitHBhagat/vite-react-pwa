// src/pages/CreatePassword.js

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Button,
  Schema,
  Message,
  Panel,
  Container,
  Row,
  Col,
  Heading,
} from "rsuite";
import { toast, ToastContainer } from "react-toastify";
import UserService from "../../../services/user.service";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setRouteData } from "../../../stores/appSlice";
import { trackPromise } from "react-promise-tracker";
import userService from "../../../services/user.service";
import "./password.css";

const { StringType } = Schema.Types;

const createPasswordModel = Schema.Model({
  password: StringType()
    .isRequired("New password is required.")
    .minLength(8, "Password should be at least 8 characters long."),
  confirmPassword: StringType()
    .isRequired("Please confirm your new password.")
    .addRule(
      (value, data) => value === data.password,
      "Passwords do not match."
    ),
});

const CreatePassword = ({ pageTitle }) => {
  const { token } = useParams();
  const [formValue, setFormValue] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const dispatch = useDispatch();
  const [send, setSend] = useState();
  const navigate = useNavigate();
  const [user, setUser] = useState();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, []);

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    if (send) {
      navigate("/");
    }
  }, [send]);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing token.");
    }
  }, [token]);

  const getUserDetails = async () => {
    try {
      const resp = await userService.getUserByToken(token);
      setUser(resp.data.data);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error fetching user details");
    }
  };

  const handleSubmit = async () => {
    try {
      const resp = await trackPromise(
        UserService.createPassword(formValue.password, token)
      );
      if (resp.data.success) {
        toast.success("Password updated successfully. You can now log in.");
        setSend(true);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <Container className="create-password-bg">
      <Row>
        <Col xs={12} className="create-password-container">
          <div className="create-password-form">
            <Heading level={4}>Create New Password</Heading>
            <Panel>
              <div className="user0name">
                Hi {user ? `${user.firstName} ${user.lastName}` : "User"}, you
                can change your password here
              </div>
              <Form
                formValue={formValue}
                onChange={setFormValue}
                onSubmit={handleSubmit}
                model={createPasswordModel}
                fluid
              >
                <Form.Group>
                  <Form.ControlLabel>New Password</Form.ControlLabel>
                  <Form.Control name="password" type="password" />
                </Form.Group>
                <Form.Group>
                  <Form.ControlLabel>Confirm New Password</Form.ControlLabel>
                  <Form.Control name="confirmPassword" type="password" />
                </Form.Group>
                <Form.Group>
                  <Button
                    className="btn-green"
                    appearance="primary"
                    type="submit"
                  >
                    Set New Password
                  </Button>
                </Form.Group>
              </Form>
            </Panel>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CreatePassword;
