import * as React from 'react'

import Game from './src/game'

export default {
  title: 'Tools',
  component: Game
};

const Template = (args) => <Game {...args} />;

export const Camera = Template.bind({});

