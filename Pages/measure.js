import React, { Component } from 'react'

import {
  Text,
  StyleSheet,
  tintColor,
  Icon
} from 'react-native';

import {
  Container,
  Content,
  Body,
  Button,
  Header,
  Title,
  List,
  ListItem,
} from 'native-base';

export default class Measure extends Component {
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
            <Title>勉強時間計測</Title>
          </Body>
        </Header>
        <Content>
          <Text>勉強時間計測</Text>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
});
