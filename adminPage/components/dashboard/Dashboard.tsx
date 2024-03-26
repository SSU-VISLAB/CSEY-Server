import {
  Box,
  H2,
  H5,
  Illustration,
  IllustrationProps,
  Text,
} from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import { ApiClient, useCurrentAdmin, useTranslation } from "adminjs";
import React from "react";
import { useNavigate } from "react-router";
type BoxType = {
  variant: string;
  title: string;
  subtitle?: string;
  href: string;
};

const pageHeaderHeight = 284;
const pageHeaderPaddingY = 74;
const pageHeaderPaddingX = 250;

const DashboardHeader = () => {
  return (
    <Box position="relative" overflow="hidden" data-css="default-dashboard">
      <Box
        position="absolute"
        top={50}
        left={-10}
        opacity={[0.2, 0.4, 1]}
        animate
      >
        <Illustration variant="Rocket" />
      </Box>
      <Box
        position="absolute"
        top={-70}
        right={-15}
        opacity={[0.2, 0.4, 1]}
        animate
      >
        <Illustration variant="Moon" />
      </Box>
      <Box
        bg="grey100"
        height={pageHeaderHeight}
        py={pageHeaderPaddingY}
        px={["default", "lg", pageHeaderPaddingX]}
      >
        <Text textAlign="center" color="white">
          <H2>관리자 페이지 title</H2>
          <Text opacity={0.8}>관리자 페이지 subtitle</Text>
        </Text>
      </Box>
    </Box>
  );
};

const boxes = ({ translateLabel }): Array<BoxType> => [

  {
    variant: "Folders",
    title: translateLabel("events"),
    href: "/admin/resources/events",
  },
  {
    variant: "Astronaut",
    title: translateLabel("notices"),
    href: "/admin/resources/notices",
  },
];

const Card = styled(Box)`
  display: ${({ flex }): string => (flex ? "flex" : "block")};
  color: ${({ theme }) => theme.colors.grey100};
  height: 100%;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.space.md};
  transition: all 1s ease-in;
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.primary100};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }
`;

Card.defaultProps = {
  variant: "container",
  boxShadow: "card",
};
const api = new ApiClient();
export const Dashboard = () => {
  const { translateLabel } = useTranslation();
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useCurrentAdmin();
  console.log({currentAdmin});
  return (
    <Box>
      <DashboardHeader />
      <Box
        mt={["xl", "xl"]}
        mb="xl"
        mx={[0, 0, 0, "auto"]}
        px={["default", "lg", "xxl", "0"]}
        position="relative"
        flex
        flexDirection="row"
        flexWrap="wrap"
        width={[1, 1, 1, 1024]}
      >
        {boxes({ translateLabel }).map((box, index) => (
          <Box key={index} width={[1 / 2]} p="lg">
            <Card
              as="a"
              href={box.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(box.href);
              }}
              target="_blank"
            >
              <Text textAlign="center">
                <Illustration
                  variant={box.variant as IllustrationProps["variant"]}
                  width={100}
                  height={70}
                />
                <H5 mt="lg">{box.title}</H5>
                <Text>{box.subtitle}</Text>
              </Text>
            </Card>
            
          </Box>
        ))}
      </Box>
    </Box>
  );
};
// https://github.com/SoftwareBrothers/adminjs/blob/master/src/frontend/components/app/default-dashboard.tsx
export default Dashboard;
