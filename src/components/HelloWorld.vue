<template>
  <div>
    <label>select file</label>
    <input type="file" id="files" @change="fileImport" /><br/>
    <label>first word: </label>
    <input type="text" v-model="s_begin"><br/>
    <label>second word: </label>
    <input type="text" v-model="s_end"><br/>
    <button type="button" @click="run" id="search">search</button><br/>
    <h2>{{msg}}</h2>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      s_begin: 'data',
      s_end: 'code',
      msg: '',
      word_list: [],
      ladder: null
    }
  },
  mounted () {
    this.ladder = new this.Graph()
    document.onkeydown = this.keyListener
  },
  methods: {
    keyListener (e) {
      if (e.keyCode === 13) {
        document.getElementById('search').click()
      }
    },
    /* eslint-disable */
    run () {
      if (this.word_list.length === 0) {
        this.msg = "You must select a dictionary file."
        return
      }
      if (this.s_begin.length === 0 || this.s_end.length === 0) {
        this.msg = "Have a nice day."
        return
      }
      if (this.s_begin === this.s_end) {
        this.msg = "The two words must be different."
        return
      }
      if (this.s_begin.length !== this.s_end.length) {
        this.msg = "The two words must be the same length."
        return
      }
      this.ladder.getDictionary(this.word_list)
      var temp = this.ladder.init(this.s_begin, this.s_end)
      if (temp.length === 0) {
        if (this.ladder.access(this.s_begin, this.s_end)) {
          this.msg = "A ladder from " + this.s_end + " back to " + this.s_begin + ":\n"
          var path = this.ladder.getLadder(this.s_begin, this.s_end)
          for (var i of path) {
            this.msg += i + " "
          }
        } else {
          this.msg = "No word ladder found from " + this.s_end + " back to " + this.s_begin + "."
        }
      } else {
        this.msg = temp
      }
    },
    fileImport () {
      var selectedFile = document.getElementById('files').files[0]
      // var name = selectedFile.name
      // var size = selectedFile.size

      var r = new FileReader()
      r.readAsText(selectedFile)
      r.onload = () => {
        this.word_list = r.result.split('\n')
      }
    },
    Graph () {
      function Edge (v, w, next) {
        this.v = v
        this.w = w
        this.next = next
      }

      function disjoint_set () {
        this.father = []

        this.init = (n) => {
          this.father = new Array(n + 1)
          for (var i = 0; i <= n; i++) this.father[i] = i
        }

        this.find = (x) => { // find x's disjoint
          if (this.father[x] == x) {
            return x
          } else {
            this.father[x] = this.find(this.father[x])
            return this.father[x]
          }
        }

        this.union = (x, y) => { // union x and y
          this.father[this.find(x)] = this.find(y)
        }
      }

      this.word_list_sub = new Array()
      this.edge = new Array()
      this.head = new Array()
      this.dictionary = {} // the same length words searching implement
      this.union_find = new disjoint_set()
      this.word_list = []

      this.getDictionary = (word_list) => {
        this.word_list = word_list
      }

      this.init = (s_begin, s_end) => { // create the graph and the nodes
        this.edge.splice(0, this.edge.length)
        this.dictionary = {}
        this.word_list_sub.splice(0, this.word_list_sub.length)
        var list_length = this.word_list.length
        var length_input = s_begin.length
        this.union_find.init(list_length)
        // clear all
        this.head = new Array(list_length)
        for (var i = 0; i < list_length; i++) {
          this.head[i] = -1
        }
        // head saves first edges,-1 represents null
        for (i = 0; i < list_length; i++) {
          var now = this.word_list[i]
          if (now.length !== length_input) continue // skip words with different length
          this.word_list_sub.push(new String(now)) // add to sub
          this.dictionary[now] = this.word_list_sub.length
        }
        console.log(this.dictionary)
        if (!this.dictionary[s_end] || !this.dictionary[s_begin]) {
          return 'The two words must be found in the dictionary.'
        }
        list_length = this.word_list_sub.length// work in word_list_sub
        for (i = 0; i < list_length; i++) {
          this.findEdgeToAdd(this.word_list_sub[i], i + 1);// i+1 presents pos in dictionary
        }
        return ''
      }

      this.findEdgeToAdd = (s, u) => {// every character in s change from 'a' to 'z' and addEdge if available
        var word_length = s.length
        for (var j = 0; j < word_length; j++) {
          for (var i = 0; i < 26; i++) {
            var c = String.fromCharCode(97 + i)
            if (String(s[j]) === c) continue
            var str = s.substring(0, j) + c + s.substring(j + 1, s.length)
            var v = this.dictionary[str]//search
            if (v) {
              this.addEdge(u, v);
            }
          }
        }
      }

      this.addEdge = (i, j) => {// addEdge from list[i-1] to list[j-1]
        this.union_find.union(i, j);
        this.edge.push(new Edge(j, 1, this.head[i]));
        this.head[i] = this.edge.length - 1;
      }

      this.access = (s_begin, s_end) => {
        var pos_begin = this.dictionary[s_begin]
        var pos_end = this.dictionary[s_end]
        return this.union_find.find(pos_begin) === this.union_find.find(pos_end)
      }

      this.getLadder = (s_begin, s_end) => {
        var path = new Array()
        var begin = this.dictionary[s_begin]
        var end = this.dictionary[s_end]
        var prev = this.spfa(this.word_list_sub.length, begin, end)// save node's previous one
        path.push(new String(s_end))
        for (var now = prev[end]; now != begin; now = prev[now]) {
          path.push(new String(this.word_list_sub[now - 1]))// dictionary saves the position+1 in word_list
        }
        path.push(new String(s_begin))
        return path
      }

      this.spfa = (tot_, start, end) => {// tot represents for list length///calculate the min and get the path
        var tot = tot_ + 2
        var prev = new Array()
        tot += 2// indicate enough alloc for vector
        var queue = new Array()// implement queue
        var vis = new Array(tot)// visited
        var distance = new Array(tot)// distance from v0
        for (var i = 0; i < tot; i++) {
          distance[i] = tot
          vis[i] = false
          prev.push(-1)// -1 represents prev not found
        }
        queue.push(start)// push v0 into queue
        distance[start] = 0
        vis[start] = true
        while (queue.length !== 0) {
          var u = queue.shift()
          vis[u] = false
          for (var i = this.head[u]; i !== -1; i = this.edge[i].next) {
            var v = this.edge[i].v
            if (distance[v] > distance[u] + this.edge[i].w) {// update
              distance[v] = distance[u] + this.edge[i].w
              prev[v] = u// save the path
              if (!vis[v]) {
                vis[v] = true
                queue.push(v)
              }
            }
          }
        }
        return prev;
      }
    }
  }
}

</script>

<style scoped>
h2 {
  color: blue;
}
</style>
