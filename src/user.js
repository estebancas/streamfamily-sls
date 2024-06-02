const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getUser = async (id) => {
  const user = await dynamodb
    .get({
      TableName: "Users",
      Key: { id },
    })
    .promise();

  return user.Item
};

const updateUser = async (event) => {
  const {
    id,
    name,
    avatar,
  } = JSON.parse(event.body);

  if (!id) {
    return {
      status: 500,
      error: "missing attrs",
    };
  }

  const user = await getUser(id);

  if (!user) {
    return {
      status: 404,
      error: "User not found",
    };
  }


  await dynamodb.update({
    TableName: 'Users',
    Key: { id },
    UpdateExpression: "set name = :n, avatar = :a",
    ExpressionAttributeValues: {
      ":a": avatar || user.avatar,
      ":n": name || user.name,
    },
    ReturnValues: "ALL_NEW",
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({ data: "Success" }),
  };
};

module.exports = {
  updateUser,
};
