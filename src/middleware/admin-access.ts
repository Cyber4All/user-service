export function enforceAdminAccess(req, res, next) {
  if (
    req.user &&
    req.user.accessGroups &&
    req.user.accessGroups.includes('admin')
  ) {
    next();
  } else {
    res.status(401).send('Invalid access!');
  }
}
