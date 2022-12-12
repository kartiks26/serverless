import { Amplify } from "aws-amplify";
import React, { use } from "react";
import awsExports from "../aws-exports";
import { useEffect, useState } from "react";
import { API, GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { listUsers } from "../graphql/queries";
import { Button, Input, Select, Space, Table, Tag } from "antd";
import { deleteUser, updateUser } from "../graphql/mutations";
const RoleOptions = ["ADMIN", "PARTNER", "VOLUNTEER", "EMPLOYEE", "STUDENT"];
Amplify.configure({ ...awsExports, ssr: false });
function Admin() {
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    const response = await API.graphql({
      query: listUsers,
      authMode: "API_KEY",
    })
      .then((response) => {
        console.log("response", response);
        setUsers(response?.data?.listUsers?.items);
        return response;
      })
      .catch((error) => {
        console.log("error", error);
        return error;
      });
  };
  const updateUserName = async (data) => {
    try {
      const updateInput = {
        email: data.email,
        name: data.name,
      };
      await API.graphql({
        query: updateUser,
        authMode: "API_KEY",
        variables: {
          input: updateInput,
        },
      }).then((response) => {
        console.log("response", response);
        // dispatch(updateUserData(response?.data?.updateUser));
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  };
  const handelUpdateUserRoles = async (data) => {
    try {
      const updateInput = {
        email: data.email,
        role: data.role,
      };
      await API.graphql({
        query: updateUser,
        authMode: "API_KEY",
        variables: {
          input: updateInput,
        },
      }).then((response) => {
        const updatedUsers = users.map((user) => {
          if (user.id === response?.data?.updateUser?.id) {
            return {
              ...user,
              role: response?.data?.updateUser?.role,
            };
          }
          return user;
        });
        setUsers(updatedUsers);
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  };
  const handelDeleteUser = async (data) => {
    try {
      API.graphql({
        query: deleteUser,
        authMode: "API_KEY",
        variables: {
          input: {
            email: data.email,
          },
        },
      }).then((response) => {
        const updatedUsers = users.filter((user) => user.id !== data.id);
        setUsers(updatedUsers);
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",

      render: (text, index) => (
        <Input
          value={text}
          onChange={(e) => {
            setUsers(
              users.map((user) => {
                if (user.id === index.id) {
                  return {
                    ...user,
                    name: e.target.value,
                  };
                }
                return user;
              })
            );
          }}
          onPressEnter={(e) => {
            updateUserName({
              email: index.email,
              name: e.target.value,
            });
          }}
        />
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (tags, index) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? "geekblue" : "green";
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
          <Select
            mode="tags"
            value={tags}
            onSelect={(value) => {
              const data = [...tags, value];
              handelUpdateUserRoles({
                email: index.email,
                role: data,
              });
            }}
            onDeselect={(value) => {
              const data = tags.filter((item) => item !== value);
              handelUpdateUserRoles({
                email: index.email,
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
        </>
      ),
    },
    {
      Title: "Delete",
      key: "delete",
      render: (text, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              handelDeleteUser(record);
            }}
            danger
            type="primary"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div>
      <Table columns={columns} dataSource={users} />
    </div>
  );
}

export default Admin;
