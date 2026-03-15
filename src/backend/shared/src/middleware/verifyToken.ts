import * as express from "express";
import * as jwt from "jsonwebtoken";

export const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const rawToken = req.body?.token || req.query?.token || req.headers["x-access-token"];
	const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

	if (!token) {
		return res.status(403).send("A token is required for authentication");
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_KEY || "");
		req.body = { ...(req.body || {}), user: decoded };
		res.locals.user = decoded;
	} catch (err) {
		return res.status(401).send("Invalid Token");
	}
	return next();
};
