import React from 'react';
import styled from 'styled-components';

const HomePageContainer = styled.div`
  padding: 20px;
`;

const HomePageTitle = styled.h2`
  color: #333;
`;

const HomePage: React.FC = () => {
  return (
    <HomePageContainer>
      <HomePageTitle>Hoş Geldiniz!</HomePageTitle>
      <p>Giderlerinizi takip etmek için burayı kullanabilirsiniz.</p>
    </HomePageContainer>
  );
};

export default HomePage;