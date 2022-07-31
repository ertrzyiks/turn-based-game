import * as React from 'react'

import swordImage from '../assets/sword.jpeg'
import Card from './card'

export default {
  title: 'Components',
  component: Card,
  argTypes: {
    color: {
      options: ['grey', 'red'],
      control: { type: 'select' },
    }
  }
};


const Template = (args) => <Card {...args} />;

Template.args = {
  name: 'Attack',
  description: 'Whirley was trained',
  color: 'red',
  image: swordImage
}

export const CombatCard = Template.bind({});

CombatCard.args = {
  ...Template.args
}
