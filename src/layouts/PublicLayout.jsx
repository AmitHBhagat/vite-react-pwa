import React, { useEffect, useState } from "react";
import { Container, Content, CustomProvider, Footer, Header } from "rsuite";
import { Outlet } from "react-router";
import PublicHeader from "../components/PublicHeader/Header";
// import PublicFooter from "../components/Footer/PublicFooter";
import "./PublicLayout.css";
import useScrollEffect from "../utilities/useScrollEffect";

const PublicLayout = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [theme, setTheme] = useState("light");

  const toggleTheme = (checked) => {
    setTheme(checked ? "light" : "dark");
  };

  const handleScroll = () => {
    setIsSticky(window.scrollY > 0);
  };
  useScrollEffect(handleScroll);

  return (
    <CustomProvider theme={theme}>
      <Container className="container-layout-user">
        {/* <Header>
          <PublicHeader />
        </Header> */}

        <Content style={{}}>
          <Outlet />
        </Content>

        {/* <Footer>
          <PublicFooter />
        </Footer> */}
      </Container>
    </CustomProvider>
  );
};

export default PublicLayout;
