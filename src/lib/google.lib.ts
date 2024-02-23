export async function getUserData(token: any) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
  );
  const data = await response.json();
  return data;
}
export async function verifyGoogleToken(idToken: any) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
    );
    //console.log(response);

    const tokenInfo = await response.json();

    //console.log(tokenInfo);

    if (tokenInfo.aud === process.env.CLIENT_ID) {
      return tokenInfo;
    } else {
      return "Error";
    }
  } catch (error: any) {
    // Manejar errores de verificación
    console.error("Error al verificar el token:", error.message);
    return "Error";
  }
}
