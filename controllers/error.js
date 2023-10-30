export const get404 = (req, res, next) => {
    const error = new Error("Not found");
    error.statusCode = 404;
    throw error;
};
  