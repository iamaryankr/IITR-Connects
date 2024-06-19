import { useMemo } from "react";
import { Box, Container } from "@chakra-ui/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import HeaderComponent from "./components/Header";
import { paths as pathconfig } from "./assets/contants/paths";
import ParticlesBg from 'particles-bg'



export const App = () => {
	const user = useRecoilValue(userAtom);
	const { pathname } = useLocation();
	
	const paths = useMemo(() => {
		return pathconfig.map(config => {
			return {
				path: config.path,
				Element: user ? config.AuthElement : config.UnAuthElement
			}
		})
	}, [user]);

	return (
		<Box position={"relative"} w='full'>
			{/* <ParticlesBg type="cobweb" bg={true} /> */}
			<Container maxW={pathname === "/" ? { base: "620px", md: "1200px" } : "620px"}>
				<HeaderComponent />
				<Routes>
					{paths.map(path => {
						const { Element } = path;
						return <Route key={path.path} path={path.path} element={<Element />} />
					})}
				</Routes>
			</Container>
		</Box>
	);
}

export default App;
