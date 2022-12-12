import { Auth, GRAPHQL_AUTH_MODE } from "@aws-amplify/auth";
import { Amplify, API } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { getUser } from "../src/graphql/queries";
import { Space, Button, Typography, Avatar, Menu, Input, Select } from "antd";
import { updateUser } from "../src/graphql/mutations";
const { Title, Text, Link } = Typography;
import awsExports from "../src/aws-exports";
import { useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../src/user/userSlice";

Amplify.configure({ ...awsExports, ssr: false });
const RoleOptions = ["ADMIN", "PARTNER", "VOLUNTEER", "EMPLOYEE", "STUDENT"];

function Profile(props) {
  const userData = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const [selectedRoleItems, setSelectedRoleItems] = useState(userData?.role);

  const handelGetUser = async (emailId) => {
    try {
      await API.graphql({
        query: getUser,
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        variables: {
          email: emailId,
        },
      }).then((response) => {
        if (response?.data?.getUser) {
          dispatch(updateUserData(response?.data?.getUser));
          setSelectedRoleItems(response?.data?.getUser?.role);
          console.log("selectedRoleItems", response);
        }
        return response;
      });
    } catch (error) {
      return error;
    }
  };
  const handelUpdateUser = async (data) => {
    try {
      const updateInput = {
        email: userData.email,
        phoneNum: data.phoneNum,
        role: data.role,
      };
      await API.graphql({
        query: updateUser,
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        variables: {
          input: updateInput,
        },
      }).then((response) => {
        dispatch(updateUserData(response?.data?.updateUser));
        setSelectedRoleItems(response?.data?.updateUser?.role);
        console.log("updated user", response);
        return response;
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  };
  useEffect(() => {
    if (!userData) {
      Auth.currentAuthenticatedUser()
        .then((currentUser) => {
          handelGetUser(currentUser?.attributes?.email);
        })
        .catch(() => console.log("Not signed in"));
    }
  }, []);

  return (
    <div>
      <Title>Name : {userData?.name}</Title>
      <Title>Email : {userData?.email}</Title>
      <Title>
        Phone Number :{" "}
        {userData?.phoneNum ? (
          <Title
            onDoubleClick={() => {
              setUserData({
                ...userData,
                phoneNum: null,
              });
            }}
          >
            {userData?.phoneNum}
          </Title>
        ) : (
          <Input
            type="number"
            maxLength={10}
            placeholder="Enter Phone Number"
            onPressEnter={(e) => {
              e.preventDefault();
              handelUpdateUser({
                phoneNum: e.target.value,
              });
            }}
          />
        )}
      </Title>
      Role
      <Select
        mode="tags"
        value={selectedRoleItems}
        onChange={setSelectedRoleItems}
        onSelect={(value) => {
          const data = [...selectedRoleItems, value];
          handelUpdateUser({
            role: data,
          });
        }}
        onDeselect={(value) => {
          const data = selectedRoleItems.filter((item) => item !== value);
          handelUpdateUser({
            role: data,
          });
        }}
        tokenSeparators={[","]}
        style={{ width: "40%" }}
        options={RoleOptions.map((item) => ({
          value: item,
          label: item,
        }))}
      />
    </div>
  );
}

export default Profile;
