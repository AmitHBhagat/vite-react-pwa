import React, { useEffect, useState } from "react";
import { Container, Content, CustomProvider, Footer, Header } from "rsuite";
import { Outlet } from "react-router";
import PublicHeader from "../components/PublicHeader/Header";
// import PublicFooter from "../components/Footer/PublicFooter";
import "./PublicLayout.css";

const PublicLayout = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [theme, setTheme] = useState("light");

  const toggleTheme = (checked) => {
    setTheme(checked ? "light" : "dark");
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.body.classList.add("body-public");

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("body-public");
    };
  }, []);

  const handleScroll = () => {
    setIsSticky(window.scrollY > 0);
  };

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
