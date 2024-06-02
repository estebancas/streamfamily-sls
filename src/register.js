const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const checkIfUserExist = async (email) => {
  const user = await dynamodb
    .query({
      TableName: "Users",
      KeyConditionExpression: "email = :e",
      ExpressionAttributeValues: {
        ":e": email,
      },
      IndexName: "EmailIndex",
    })
    .promise();

  return Boolean(user.Items && user.Items.length > 0);
};

const register = async (event) => {
  const {
    name,
    email,
    subscriptions = [],
    sponsoredSubscriptions = [],
    password,
    avatar,
  } = JSON.parse(event.body);

  if (!name || !email || !password) {
    return {
      status: 500,
      error: "missing attrs",
    };
  }

  const exist = await checkIfUserExist(email);

  if (exist) {
    return {
      status: 500,
      error: "Please use another email",
    };
  }

  const id = uuidv4();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = {
    id,
    name,
    email,
    subscriptions,
    sponsoredSubscriptions,
    avatar,
    password: hash,
    logged: true,
    fee: 0,
  };

  await dynamodb
    .put({
      TableName: "Users",
      Item: user,
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ data: "Success" }),
  };
};

module.exports = {
  register,
};
