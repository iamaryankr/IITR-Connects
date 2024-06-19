import React from "react";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { Link } from "./Link";
import userAtom from "../atoms/userAtom";
import authScreenAtom from "../atoms/authAtom";
import useLogout from "../hooks/useLogout";

const HeaderComponent = () => {
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
	const setAuthScreen = useSetRecoilState(authScreenAtom);

	const authScreenHandler = React.useCallback((page) => {
		return () => setAuthScreen(page)
	}, []);

	return (
		<Flex justifyContent={"space-between"} mt={6} mb='12'>
			{user ? (
				<>
					<Flex>
						<Link to='/'>
							<Heading fontSize={"xl"} textAlign={"center"} color={"beige"}>
								IIT-R Connects
							</Heading>
						</Link>
					</Flex>
					<Flex alignItems={"center"} gap={4}>
						<Link to='/'>
							<AiFillHome size={24} />
						</Link>
						<Link to={`/${user.username}`}>
							<RxAvatar size={24} />
						</Link>
						<Link to={`/chat`}>
							<BsFillChatQuoteFill size={20} />
						</Link>
						<Button size={"xs"} onClick={logout}>
							<FiLogOut size={20} />
						</Button>
					</Flex>
				</>
			) : (
				<>
					<Link to={"/auth"} onClick={authScreenHandler("login")}>
						Login
					</Link>
					<Link to={"/auth"} onClick={authScreenHandler("signup")}>
						Sign up
					</Link>
				</>
			)}
		</Flex>
	);
};

export default HeaderComponent;
