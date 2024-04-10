import {
  Box,
  H2,
  H5,
  Illustration,
  IllustrationProps,
  Text,
} from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import { useCurrentAdmin, useTranslation } from "adminjs";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useLog } from "./hook";
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
export const Dashboard = (props) => {
  const { translateLabel } = useTranslation();
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useCurrentAdmin();
  const log = useLog();
  const lines = log.split('\n');
  const logRef = useRef<HTMLPreElement>(null);
  const maxLineNumberLength = String(lines.length).length;

  useEffect(() => {
    // logRef가 현재 가리키는 요소의 스크롤을 맨 밑으로 설정
    if (logRef.current && log) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

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
        <Box width={[1]} p="lg">
          <Card>
            <Text textAlign="left">
              Log
              <Text ref={logRef} as="pre" height={400} className="log-box">
                {lines.map((line, index) => {
                  // 라인 번호 포맷팅: 번호를 문자열로 변환하고, 필요한 만큼 공백으로 채움
                  const lineNumber = `${index + 1}`.padEnd(maxLineNumberLength, ' ');
                  return (
                    <div key={index} className="log-wrapper" style={{gap: `${maxLineNumberLength * 8}px`}}>
                      <div style={{color: 'gray', userSelect: 'none'}}>{`${lineNumber}`   }</div>
                      <div className="log-line">{`${line}`}</div>
                    </div>
                  );
                })}
              </Text>
            </Text>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};
// https://github.com/SoftwareBrothers/adminjs/blob/master/src/frontend/components/app/default-dashboard.tsx
export default Dashboard;
