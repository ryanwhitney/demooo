import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const uploadLink = createUploadLink({
  uri: `${API_URL}/graphql/`,
});

const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem("authToken");
	return {
		headers: {
			...headers,
			authorization: token ? `JWT ${token}` : "",
		},
	};
});

export const client = new ApolloClient({
	link: authLink.concat(uploadLink),
	cache: new InMemoryCache(),
});
