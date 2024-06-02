const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getUser = async (id) => {
  const user = await dynamodb.get({
    TableName: 'Users',
    Key: {
        id
    }
  }).promise()

  return user.Item;
};

const setUserLoggedout = (id) => {
  dynamodb.update({
    TableName: "TaskTable",
    Key: { id },
    UpdateExpression: "set logged = :l",
    ExpressionAttributeValues: {
      ":l": false,
    },
    ReturnValues: "ALL_NEW",
  });
};

const logout = async (event) => {
  const { id } = JSON.parse(event.body);

  if (!id) {
    return {
      status: 500,
      error: "bad request",
    };
  }

  const user = await getUser(email);

  if (!user) {
    return {
      status: 404,
      message: "User not found",
    };
  }

  setUserLoggedout(id);

  return {
    statusCode: 200,
    body: JSON.stringify({ data: 'success' }),
  };
};

module.exports = {
  logout,
};
