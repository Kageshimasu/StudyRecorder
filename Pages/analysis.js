import React, { Component } from 'react'
import {
  Text,
  StyleSheet
} from 'react-native'


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

export default class Analysis extends Component {
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
            <Title>データ統計</Title>
          </Body>
        </Header>
        <Content>
          <Text>データ統計</Text>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
});
