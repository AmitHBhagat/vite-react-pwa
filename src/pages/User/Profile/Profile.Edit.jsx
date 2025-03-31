import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Button, Form, Schema, Panel } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import EnvConfig from "../../../envConfig";
import "./profile.css";
import { trackPromise } from "react-promise-tracker";
import UserService from "../../../services/user.service";
import { setRouteData } from "../../../stores/appSlice";
import { setUser } from "../../../stores/authSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { updateUserProfile } from "../../../stores/store";

const { StringType, BooleanType } = Schema.Types;

const model = Schema.Model({
  firstName: StringType().isRequired("First Name is required."),
  lastName: StringType().isRequired("Last Name is required."),
  phone: StringType()
    .isRequired("Phone is required.")
    .minLength(10, "Phone number should be 10 digits")
    .maxLength(10, "Phone number should be 10 digits"),
  email: StringType()
    .isEmail("Please enter a valid email.")
    .isRequired("Email is required."),
});

const addressModel = Schema.Model({
  city: StringType().isRequired("City is required."),
  state: StringType().isRequired("State is required."),
  pincode: StringType()
    .isRequired("Postal Code is required.")
    .minLength(6, "Pincode must be 6 digits")
    .maxLength(6, "Pincode must be 6 digits"),
  lane: StringType().isRequired("Lane is required."),
  landmark: StringType().isRequired("Landmark is required."),
  phone: StringType()
    .isRequired("Phone is required.")
    .minLength(10, "Phone number should be 10 digits")
    .maxLength(10, "Phone number should be 10 digits"),
  isDefault: BooleanType(),
});

function UserProfile({ pageTitle }) {
  const authState = useSelector((state) => state.authState);
  const formRef = useRef();
  const user = authState.user;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, []);

  const [formValue, setFormValue] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  const [formError, setFormError] = useState({});
  const [addressValue, setAddressValue] = useState({
    city: "",
    state: "",
    pincode: "",
    lane: "",
    landmark: "",
    phone: "",
    isDefault: false,
  });

  const [addressError, setAddressError] = useState({});
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(
    addresses?.findIndex((addr) => addr.isDefault)
  );

  const handleAddAddress = () => {
    const isValid = addressModel.check(addressValue);
    if (!isValid) {
      setAddressError(addressModel.check(addressValue));
      return;
    }

    let updatedAddresses = [...addresses];

    if (updatedAddresses.length === 0) {
      addressValue.isDefault = true;
    } else if (addressValue.isDefault) {
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
    }

    if (editingIndex !== null) {
      updatedAddresses[editingIndex] = addressValue;
      setEditingIndex(null);
    } else {
      updatedAddresses.push(addressValue);
    }

    setAddresses(updatedAddresses);
    setAddressValue({
      city: "",
      state: "",
      pincode: "",
      lane: "",
      landmark: "",
      phone: "",
      isDefault: false,
    });

    setAddressError({});
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!formRef.current.check()) {
      return;
    }
    const formData = new FormData();

    Object.keys(formValue).forEach((key) => {
      formData.append(key, formValue[key]);
    });

    if (selectedImage) {
      formData.append("profileImage", selectedImage);
    }

    if (addresses.length > 0) {
      formData.append("addresses", JSON.stringify(addresses));
    }

    try {
      const resp = await trackPromise(
        UserService.updateProfile(formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
      updateUserProfile();
      navigate(-1);
      setFormError({});
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <Container className="profile-container">
      <ScrollToTop />
      <Col xs={22} md={20} className="profile">
        <Row gutter={16}>
          <Col xs={24}>
            <Container className="profile-panel">
              <h4 className="panel-header">My Profile</h4>
              <Form
                fluid
                ref={formRef}
                model={model}
                onCheck={(formError) => setFormError(formError)}
                onSubmit={handleSubmit}
                formValue={formValue}
                onChange={setFormValue}
              >
                <Row gutter={50}>
                  <Col xs={24} lg={10} className="image-col">
                    <img
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : `${EnvConfig?.MediaBase}/${user.assetsDir}/${user.profileImage}`
                      }
                      alt="Profile"
                      className="profile-image"
                    />
                    <div className="custom-file-upload">
                      <label
                        htmlFor="file-upload"
                        className="custom-fil-label btn-green"
                      >
                        Choose File
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-upload-input"
                      />
                    </div>
                  </Col>
                  <Col xs={24} lg={14}>
                    <Col xs={24} lg={14}>
                      <Form.Group controlId="firstName">
                        <Form.ControlLabel>First Name</Form.ControlLabel>
                        <Form.Control name="firstName" />
                      </Form.Group>
                    </Col>
                    <Col xs={24} lg={14}>
                      <Form.Group controlId="lastName">
                        <Form.ControlLabel>Last Name</Form.ControlLabel>
                        <Form.Control name="lastName" />
                      </Form.Group>
                    </Col>

                    <Col xs={24} lg={14}>
                      <Form.Group controlId="phone">
                        <Form.ControlLabel>Phone</Form.ControlLabel>
                        <Form.Control name="phone" />
                      </Form.Group>
                    </Col>
                    <Col xs={24} lg={14}>
                      <Form.Group controlId="email">
                        <Form.ControlLabel>Email</Form.ControlLabel>
                        <Form.Control name="email" />
                      </Form.Group>
                    </Col>
                  </Col>
                </Row>
              </Form>

              <Row
                className="profile-s-flex"
                gutter={16}
                style={{ marginTop: "1.25rem" }}
              >
                <Col xs={24} md={12}>
                  <h4 className="panel-header">Add Addresses</h4>
                  <Panel bordered>
                    <Form
                      fluid
                      model={addressModel}
                      formValue={addressValue}
                      onChange={setAddressValue}
                      onSubmit={handleAddAddress}
                    >
                      <Row gutter={16}>
                        <Col xs={24}>
                          <Form.Group controlId="pincode">
                            <Form.ControlLabel>Pincode</Form.ControlLabel>
                            <Form.Control type="number" name="pincode" />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24}>
                          <Form.Group controlId="lane">
                            <Form.ControlLabel>
                              Area, Street, Sector, Village
                            </Form.ControlLabel>
                            <Form.Control name="lane" />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24}>
                          <Form.Group controlId="landmark">
                            <Form.ControlLabel>Landmark</Form.ControlLabel>
                            <Form.Control name="landmark" />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={12}>
                          <Form.Group controlId="city">
                            <Form.ControlLabel>City</Form.ControlLabel>
                            <Form.Control name="city" />
                          </Form.Group>
                        </Col>
                        <Col xs={12}>
                          <Form.Group controlId="state">
                            <Form.ControlLabel>State</Form.ControlLabel>
                            <Form.Control name="state" />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24}>
                          <Form.Group controlId="phone">
                            <Form.ControlLabel>Phone</Form.ControlLabel>
                            <Form.Control name="phone" />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24}>
                          <Button
                            appearance="primary"
                            type="submit"
                            className="address-btn btn-green"
                          >
                            {editingIndex !== null ? "Update" : "Add"} Address
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Panel>
                </Col>
                <Col xs={24} md={12}>
                  <h4 className="panel-header">My Addresses</h4>
                  <Row gutter={16}>
                    {addresses.map((address, index) => (
                      <Col xs={24} key={index}>
                        <div>Address card edit</div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>

              <Row gutter={16} className="submit-row">
                <Col xs={8} md={4} lg={3}>
                  <Button
                    className="checkout-btn btn-green"
                    appearance="primary"
                    type="submit"
                    onClick={handleSubmit}
                  >
                    Save Profile
                  </Button>
                </Col>
                <Col xs={7} md={4} lg={3}>
                  <Button
                    className="checkout-btn"
                    appearance="default"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Col>
    </Container>
  );
}

export default UserProfile;
