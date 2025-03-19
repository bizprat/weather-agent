import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

dotenv.config();

const model = new ChatOpenAI({ model: 'gpt-4o-mini' });

// const messages = [
//   new SystemMessage('You are an helpful assistant'),
//   new HumanMessage('Hi!'),
// ];

const systemTemplate =
  'Translate the following from English into {language}';

const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', systemTemplate],
  ['user', '{text}'],
]);

async function init() {
  const promptValue = await promptTemplate.invoke({
    language: 'Bhojpuri',
    text: 'Hey, how are you?',
  });

  // console.log(promptValue.toChatMessages());

  const response = await model.invoke(promptValue);

  console.log(response.content);
  console.log(response);
}

init();
