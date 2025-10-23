// Create clients and set shared const values outside of the handler.
export const getByIdHandler = async (event) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "getById working!" }),
  };
};

