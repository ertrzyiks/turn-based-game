import * as React from 'react'

import { createMachine, assign } from "xstate";
import { useMachine } from '@xstate/react'

interface HeroContext {
    name: string | null
    strength: number
    dexterity: number
}

interface StoryContext {
    health: number
}

const heroMachine = createMachine<HeroContext>({
    id: 'hero',
    initial: 'name',
    context: {
        name: null,
        strength: 10,
        dexterity: 10
    },
    states: {
        name: {
            on: {
                SUBMIT: {
                    target: 'stats',
                    actions: ['storeName']
                },
            }
        },
        stats: {
            on: {
                UPDATE: {
                    actions: assign({
                        strength: (context, event) => event.strength,
                        dexterity: (context, event) => event.dexterity
                    })
                },
                SUBMIT: {
                    target: 'completed'
                }
            }
        },
        completed: {
            type: 'final',
        }
    },
    },
    {
        actions: {
            storeName: assign({ name: (context, event) => event.name })
        }
    }
)

// const storyMachine = createMachine<StoryContext>({
//     id: 'story',
//     initial: 'start',
//     context: {
//         health: 100
//     }
// })

const HeroName = ({ onSubmit }: { onSubmit: (values: { name: string }) => void }) => {
    return (
        <div>
            <div>
                <label>
                    Hero name
                    <input type="text" />
                </label>
            </div>
            <button onClick={() => {
                onSubmit({ name: 'Ala' })
            }}>
              Next
            </button>
        </div>
    )
}

const HeroStats = ({ onSubmit, onChange }: { onSubmit: () => void, onChange: (values: { strength: number, dexterity: number }) => void }) => {
    return (
        <div>
            Siema

            <button onClick={() => {
                onChange({ strength: 15, dexterity: 20 })
                onSubmit()
            }}>
              Next
            </button>
        </div>
    )
}

const HeroCreator = () => {
    const [current, send] = useMachine(heroMachine);

    const { value, context } = current

    return <div>
        {value} {JSON.stringify(context)}

        {current.matches('name') && <HeroName onSubmit={({ name }) => send('SUBMIT', { name })} />}
        {current.matches('stats') && (
            <HeroStats
                onChange={({ strength, dexterity }) => send('UPDATE', { strength, dexterity })}
                onSubmit={() => send('SUBMIT')}
            />
        )}

    </div>
}

const Game = () => {
    return <div>
        <HeroCreator />
    </div>
}

export default Game
