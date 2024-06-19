import { Link as BaseLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export const Link = (props) => {
    return (
        <BaseLink as={RouterLink} to={props.to} onClick={props.onClick}>
            {props.children}
        </BaseLink>
    )
}