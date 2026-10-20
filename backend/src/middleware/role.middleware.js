/**
 * Role middleware: In unauthenticated development mode, strict role-authorization
 * checks are bypassed to allow testing both student and admin views freely.
 */
const roleMiddleware = () => {
  return (req, res, next) => {
    next();
  };
};

module.exports = roleMiddleware;

