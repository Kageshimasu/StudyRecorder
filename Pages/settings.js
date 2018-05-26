import React, { Component } from 'react';

import {
  Text,
  StyleSheet

} from 'react-native';


import {
  Container,
  Content,
  Body,
  Button,
  Header,
  Title,
  Icon,
  List,
  ListItem,
} from 'native-base';

export default class Settings extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    return (
      <Container>
        <Header>
          <Body>
            <Title>設定</Title>
          </Body>
        </Header>
        <Content>
          <Text>設定画面</Text>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
});
