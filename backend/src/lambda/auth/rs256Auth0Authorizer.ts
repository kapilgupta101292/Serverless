import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";

import { verify } from "jsonwebtoken";

// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from "../../auth/JwtPayload";

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJexisBWMYRxbPMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi04dzl0ZHF0ei51cy5hdXRoMC5jb20wHhcNMjAxMDA0MDg0NDA3WhcN
MzQwNjEzMDg0NDA3WjAkMSIwIAYDVQQDExlkZXYtOHc5dGRxdHoudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtq5Pj24Uv5E26CRe
9wEpIpvI30hGu0FvIygj9TfCWBffrkTgT/4ql1gv92EXUVkmvZD1LY7iqi1E79kn
4+Hi2LwiGe0chAYj5oog4sQAdOMQt1GbNpXs5Dx6qyYGNfs2y/KNg9wg9e9CqDOn
jCtAJiJqmt8P4INsVjj8jCa1rRHbZ9bpRTgw5zwaazM/pfi5BIm16cXKt4b6yQdP
Rs/v7NJa2/e01dwLCiGpkbV46svajht/QvXos1Dic21S0nU89N1N/rw8lhjq5xuQ
xhi4rPsfWeDRGdPeSQ9pYL1rfC1PusrzPqmZrHZ3gnB+z8qKV+d3BQHe/DWUtA5H
8tI2OQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSLwxyewmak
LQYd2Ff34IYpRZuvsDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AKkGzf+WfHlpX8G1SC4prOgrOH7b/hQOknJA05GxBNJVNF38siG91lyh70i9tSi5
xk4b2pH9JhldXDgnGwkSXuokRPlLOiGvBgCzVyZUKNA87Cnyd4DIFSj8sQ7F9522
/Tji16GnPJkI3H5IKnMx+Y8FdA3z9fyxrDH6UJhKR625ahdOhaWJ/aYBRsAHUC5n
xGgXqL8CdC9k8h8IVIyDkS8LVWo4HD2NHE85EnS1hedLJOzu03hGn3dW45+Qltxf
T7s/k4PrHsIEWFykzVqkJxrIZ+mNqz83fDCv6PSjJIq0QSEnGzSBESqilcggx+e/
Mg0+4HibuJLSdy25ax+UPUI=
-----END CERTIFICATE-----`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken);
    console.log("User was authorized", jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    console.log("User authorized", e.message);

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
}
