import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/theme-utils";
import { ColorModeScript } from "@chakra-ui/color-mode";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import ReactDOM from "react-dom/client";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import App from "./App.jsx";
import "./index.css";

const styles = {
	global: (props) => ({
		body: {
			color: mode("grey", "whiteAlpha.900")(props),
			bg: mode("gray.100", "#121d26")(props),
		},
	}),
};

const config = {
	initialColorMode: "dark",
	useSystemColorMode: false,
};

const colors = {
	gray: {		
		dark: "#040608"
	},
};

const theme = extendTheme({ config, styles, colors });

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);


root.render(
	<React.StrictMode>
	  <RecoilRoot>
		<BrowserRouter>
		  <ChakraProvider theme={theme}>
			<ColorModeScript initialColorMode={theme.config.initialColorMode} />
			<SocketContextProvider>
			  <App />
			</SocketContextProvider>
		  </ChakraProvider>
		</BrowserRouter>
	  </RecoilRoot>
	</React.StrictMode>
  );
// ReactDOM.createRoot(document.getElementById("root")).render(
// 	<React.StrictMode>
// 		<RecoilRoot>
// 			<BrowserRouter>
// 				<ChakraProvider theme={theme}>
// 					<ColorModeScript initialColorMode={theme.config.initialColorMode} />
// 					<SocketContextProvider>
// 						<App />
// 					</SocketContextProvider>
// 				</ChakraProvider>
// 			</BrowserRouter>
// 		</RecoilRoot>
// 	</React.StrictMode>
// );
