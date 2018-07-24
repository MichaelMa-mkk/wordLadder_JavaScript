import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '../src/components/HelloWorld.vue'
import testDictionary from './testDictionary'

describe('HelloWorld.vue', () => {
  it('print WordLadder when "search" button is clicked', () => {
    const wrapper = shallowMount(HelloWorld, {
      data () {
        return {
          word_list: testDictionary.wordList
        }
      }
    })
    wrapper.find('#search').trigger('click')
    expect(wrapper.find('h2').text()).contains('code cade cate date data')
  })

  it('print hint message when two words are empty', () => {
    const wrapper = shallowMount(HelloWorld, {
      data () {
        return {
          word_list: testDictionary.wordList,
          s_begin: '',
          s_end: ''
        }
      }
    })
    wrapper.find('#search').trigger('click')
    expect(wrapper.find('h2').text()).contains('Have a nice day')
  })

  it('print hint message when two words are the same', () => {
    const wrapper = shallowMount(HelloWorld, {
      data () {
        return {
          word_list: testDictionary.wordList,
          s_begin: 'code',
          s_end: 'code'
        }
      }
    })
    wrapper.find('#search').trigger('click')
    expect(wrapper.find('h2').text()).contains('The two words must be different')
  })

  it('print hint message when two words have different length', () => {
    const wrapper = shallowMount(HelloWorld, {
      data () {
        return {
          word_list: testDictionary.wordList,
          s_begin: 'code',
          s_end: 'array'
        }
      }
    })
    wrapper.find('#search').trigger('click')
    expect(wrapper.find('h2').text()).contains('The two words must be the same length')
  })

  it('print hint message when there is no dictionary', () => {
    const wrapper = shallowMount(HelloWorld)
    wrapper.find('#search').trigger('click')
    expect(wrapper.find('h2').text()).contains('You must select a dictionary file')
  })

  it('print hint message when words cannot be found in dictionary', () => {
    const wrapper = shallowMount(HelloWorld, {
      data () {
        return {
          word_list: testDictionary.wordList,
          s_begin: 'shiina',
          s_end: 'takagi'
        }
      }
    })
    wrapper.find('#search').trigger('click')
    expect(wrapper.find('h2').text()).contains('The two words must be found in the dictionary')
  })

  it('print hint message when there is no word ladder', () => {
    const wrapper = shallowMount(HelloWorld, {
      data () {
        return {
          word_list: testDictionary.wordList,
          s_begin: 'kitty',
          s_end: 'gorge'
        }
      }
    })
    wrapper.find('#search').trigger('click')
    expect(wrapper.find('h2').text()).contains('No word ladder found from')
  })
})
