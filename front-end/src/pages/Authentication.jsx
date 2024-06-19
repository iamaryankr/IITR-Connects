import { useRecoilValue } from "recoil";
import LoginCard from "../components/login";
import SignupCard from "../components/signUp";
import authScreenAtom from "../atoms/authAtom";

const AuthPage = () => {
	const authScreenState = useRecoilValue(authScreenAtom);

	return <>{authScreenState === "login" ? <LoginCard /> : <SignupCard />}</>;
};

export default AuthPage;
