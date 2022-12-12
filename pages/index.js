import styles from "../styles/Home.module.css";
import { Space, Button, Typography, Avatar, Menu, Select } from "antd";
import awsExports from "../src/aws-exports";
import { API, GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { Auth, CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { useEffect, useState } from "react";
import { Amplify, Hub } from "aws-amplify";
import { getUser } from "../src/graphql/queries";
import Head from "next/head";
import { createUser } from "../src/graphql/mutations";
import { UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { updateUserData } from "../src/user/userSlice";
import { setCurrentRole } from "../src/user/roleSlice";
import Admin from "../src/components/Admin";

const { Title, Text, Link } = Typography;
Amplify.configure({ ...awsExports, ssr: false });
export default function Home() {
  const [current, setCurrent] = useState("mail");
  const router = useRouter();
  const userData = useSelector((state) => state?.user);
  const currentRole = useSelector((state) => state?.currentRole);
  const dispatch = useDispatch();

  // Functions
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
        } else {
          handelCreateUser(emailId);
        }
        return response;
      });
    } catch (error) {
      handelCreateUser(emailId);
      return error;
    }
  };
  const handelCreateUser = async (emailId) => {
    try {
      const createInput = {
        name: "user",
        email: emailId,
        role: ["STUDENT"],
      };

      const request = await API.graphql({
        query: createUser,
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        variables: {
          input: createInput,
        },
      }).then((response) => {
        dispatch(updateUserData(response?.data?.createUser));
      });
    } catch (errors) {
      console.log("error", errors);
      // throw new Error(errors[0].message);
    }
  };
  // Functions End here
  const items = [
    {
      label: (
        <Avatar
          icon={<UserOutlined size="large" />}
          size="large"
          shape="square"
          style={{
            padding: "10px",
            margin: "10px",
          }}
        />
      ),
      key: "SignedInMenu",
      children: [
        {
          label: "Profile",
          key: "Profile",
          onClick: () => {
            router.push(
              {
                pathname: "/profile",
                query: { email: userData.email },
              },
              "/profile"
            );
          },
        },
        {
          label: (
            <Button
              danger
              block
              type="primary"
              onClick={() => {
                Auth.signOut();
              }}
            >
              Sign out
            </Button>
          ),
          key: "Sign Out",
        },
      ],
    },
  ];
  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          break;
        case "signOut":
          break;
        case "customOAuthState":
          setCustomState(data);
      }
    });
    Auth.currentAuthenticatedUser()
      .then((currentUser) => {
        if (!userData) {
          handelGetUser(currentUser?.attributes?.email);
        }
      })
      .catch(() => console.log("Not signed in"));
    return unsubscribe;
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <Title>Home Page</Title>
        <Title keyboard level={4}>
          You are signed in as <Text mark> {userData?.email}</Text>
        </Title>
        <Select
          value={currentRole || "Select Role"}
          style={{
            width: 120,
          }}
          onChange={(val) => {
            dispatch(setCurrentRole(val));
          }}
          options={userData?.role?.map((role) => {
            return { label: role, value: role };
          })}
        />
        {userData ? (
          <Menu
            onClick={onClick}
            selectedKeys={[current]}
            mode="horizontal"
            items={items}
          />
        ) : (
          <Button
            type="primary"
            onClick={() =>
              Auth.federatedSignIn({
                provider: CognitoHostedUIIdentityProvider.Google,
              })
            }
          >
            Google
          </Button>
        )}
      </div>
      <div>
        {
          {
            STUDENT: <div>Student</div>,
            PARTNER: <div>PARTNER</div>,
            ADMIN: <Admin />,
            VOLUNTEER: <div>Volunteer</div>,
            EMPLOYEE: <div>Employee</div>,
          }[currentRole]
        }
      </div>
    </div>
  );
}
