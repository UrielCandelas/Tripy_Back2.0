import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_KEY ?? "secret";

export function createAccessToken(payload: any, expiresIn: string = "1h") {
	return new Promise((resolve, reject) => {
		jwt.sign(
			payload,
			SECRET,
			{
				expiresIn,
			},
			(err, token) => {
				if (err) return reject(err);
				resolve(token);
			}
		);
	});
}
