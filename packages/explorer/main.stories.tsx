import * as React from 'react'

import Game from './src/game'

export default {
  title: 'Games',
  component: Game
};

const Template = (args) => <Game {...args} />;

export const Explorer = Template.bind({});

