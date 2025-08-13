const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

// Función para crear una evaluación de reCAPTCHA
async function createAssessment({
  projectID = "pagina-radio-cha-1705969164687",
  recaptchaKey = "6LfraZUpAAAAAMDH8BZYuqrjpTZSDbX_AKJ5Wu_h",
  token = "g-recaptcha-response",
  recaptchaAction = "BTNCONTACTO",
}) {
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  };

  const [response] = await client.createAssessment(request);

  if (!response.tokenProperties.valid) {
    console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
    return null;
  }

  if (response.tokenProperties.action === recaptchaAction) {
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
    response.riskAnalysis.reasons.forEach((reason) => {
      console.log(reason);
    });

    return response.riskAnalysis.score;
  } else {
    console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
    return null;
  }
}

// Middleware para verificar reCAPTCHA
function verifyRecaptcha(req, res, next) {
  const tokenValue = req.body['g-recaptcha-response'];
  createAssessment({
    projectID: process.env.RECAPTCHA_PROJECT_ID,
    recaptchaKey: process.env.RECAPTCHA_SITE_KEY,
    token: tokenValue,
    recaptchaAction: "BTNCONTACTO",
  }).then((recaptchaScore) => {
    console.log("token:   "+tokenValue);
    if (recaptchaScore !== null && recaptchaScore >= 0.5) {
      next(); // Continuar con el siguiente middleware o ruta
    } else {
      req.flash("error_msg", "Error en la verificación reCAPTCHA");
      res.redirect("/contacto");
    }
  }).catch((error) => {
    console.error("Error al verificar reCAPTCHA:", error);
    req.flash("error_msg", "Error al verificar reCAPTCHA");
    res.redirect("/contacto");
  });
}

module.exports = verifyRecaptcha;
