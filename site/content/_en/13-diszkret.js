(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['diszkret/szamelmelet'] = {
    title: 'Divisibility, congruences, combinatorics',
    lead: 'Division with remainder is the "coordinate system" of the integers. A congruence is nothing but arithmetic with remainders; combinatorics is the science of counting, where the questions of order and repetition decide the method.',
    summary: 'The toolkit of divisibility: the Euclidean algorithm, Bézout coefficients and modular inverses, congruences and Fermat\'s little theorem; then the counting formulas, the binomial theorem, the pigeonhole principle and inclusion-exclusion.',
    why: [
      R`Divisibility and division with remainder are fundamental because every integer can be written uniquely in the form $a=qb+r$ with $0\le r<b$. This representation makes the Euclidean algorithm possible: the set of common divisors does not change when $a$ is replaced by its remainder. The algorithm is therefore not a trick but the repeated application of division with remainder, which reaches the greatest common divisor in finitely many steps.`,
      R`The congruence $a\equiv b\pmod m$ means that $a$ and $b$ leave the same remainder on division by $m$, that is, $m\mid(a-b)$. Congruences can therefore be manipulated like equalities: we may add, multiply and exponentiate. The exception is division: one may divide only by a number relatively prime to the modulus. Fermat's little theorem states precisely that for a prime modulus the nonzero residues form a group, hence $a^{p-1}\equiv1$. This makes it possible to compute the remainder of large powers quickly.`,
      R`In combinatorics there are three questions: does order matter, may elements be repeated, and are all elements used. The formulas for permutations, variations and combinations all come from the same multiplication rule; the binomial coefficient counts in how many ways one can choose $k$ elements out of $n$. The binomial theorem, the pigeonhole principle and inclusion-exclusion are all counting tools that recur as patterns in exam problems.`
    ],
    when: 'For divisibility and remainder problems (gcd, lcm, linear congruences, the remainder of a large power), the Euclidean algorithm and Fermat\'s little theorem are the fastest route. In combinatorics, first decide whether order matters and whether repetition is allowed; after that the formula is mechanical. The pigeonhole principle and inclusion-exclusion are needed when the problem is phrased as "there certainly exists..." or "how many are there such that...".',
    theory: [
      {
        title: 'Divisibility and division with remainder',
        body: R`We say that $a\mid b$ ($a$ divides $b$) if there is an integer $c$ such that $b=ac$. For every integer $a$ and every integer $b>0$ there exist uniquely $q$ and $r$ such that
$$a=qb+r,\qquad 0\le r<b.$$
Here $q$ is the quotient and $r$ is the remainder. The greatest common divisor of $a$ and $b$ is $\gcd(a,b)$, the least common multiple is $\operatorname{lcm}(a,b)$; it holds that $\gcd(a,b)\cdot\operatorname{lcm}(a,b)=|ab|$.`
      },
      {
        title: 'Euclidean algorithm',
        body: R`The greatest common divisor of $a$ and $b$ does not change if the larger one is replaced by its remainder:
$$\gcd(a,b)=\gcd(b,\ a\bmod b).$$
Repeating this, the remainders strictly decrease, so the procedure terminates; the last nonzero remainder is the $\gcd$.`
      },
      {
        title: 'Extended Euclid, modular inverse',
        body: R`Running the algorithm backwards produces the Bézout coefficients:
$$ax+by=\gcd(a,b).$$
If $\gcd(a,m)=1$, then the solution of the congruence $ax\equiv1\pmod m$ is $x\equiv a^{-1}\pmod m$, which we read off from the Bézout representation $ax+my=1$.`
      },
      {
        title: 'Operations with congruences',
        note: R`If $a\equiv b$ and $c\equiv d\pmod m$, then $a+c\equiv b+d$ and $ac\equiv bd\pmod m$. Exponentiation is also allowed. Division is permitted only if the numerator and the modulus are relatively prime.`
      },
      {
        title: 'Fermat\'s little theorem',
        body: R`If $p$ is prime and $p\nmid a$, then
$$a^{p-1}\equiv1\pmod p.$$
More generally, by Euler's theorem: if $\gcd(a,m)=1$, then $a^{\varphi(m)}\equiv1\pmod m$, where $\varphi(m)$ is the number of integers between $1$ and $m$ that are relatively prime to $m$.`
      },
      {
        title: 'Basic formulas of combinatorics',
        note: R`In a combination order does not matter; in a variation it does. Combination with repetition: $\binom{n+k-1}{k}$.`
      },
      {
        title: 'Binomial theorem',
        body: R`$$(a+b)^n=\sum_{k=0}^n\binom nk a^{n-k}b^k.$$
The binomial coefficients satisfy Pascal's identity: $\binom nk=\binom{n-1}{k-1}+\binom{n-1}{k}$.`
      },
      {
        title: 'Pigeonhole principle and inclusion-exclusion',
        body: R`Pigeonhole principle: if $n$ objects are placed into $m<n$ boxes, then some box contains at least two objects. Inclusion-exclusion for two sets:
$$|A\cup B|=|A|+|B|-|A\cap B|,$$
and for three: $|A\cup B\cup C|=|A|+|B|+|C|-|A\cap B|-|A\cap C|-|B\cap C|+|A\cap B\cap C|$.`
      },
      {
        title: 'The trap of division in congruences',
        body: R`The congruence $2x\equiv2\pmod4$ does not imply $x\equiv1\pmod4$: the solutions are $x\equiv1$ and $x\equiv3\pmod4$. We may divide if the common factor is relatively prime to the modulus; here $\gcd(2,4)=2\neq1$, so the modulus is divided as well: $x\equiv1\pmod2$.`
      }
    ],
    examples: [
      {
        title: 'Greatest common divisor with Euclid',
        problem: R`Compute $\gcd(84,30)$.`,
        steps: [
          R`$84=2\cdot30+24$.`,
          R`$30=1\cdot24+6$.`,
          R`$24=4\cdot6+0$ — the remainder is zero, so the procedure ends.`,
          R`The last nonzero remainder is $6$, hence $\gcd(84,30)=6$.`
        ],
        answer: R`$\gcd(84,30)=6$`
      },
      {
        title: 'Modular inverse',
        problem: R`Find the inverse of $7$ modulo $26$.`,
        steps: [
          R`Euclid: $26=3\cdot7+5$; $7=1\cdot5+2$; $5=2\cdot2+1$.`,
          R`Backwards: $1=5-2\cdot2=5-2(7-5)=3\cdot5-2\cdot7$.`,
          R`Then $5=26-3\cdot7$, so $1=3(26-3\cdot7)-2\cdot7=3\cdot26-11\cdot7$.`,
          R`Thus $-11\cdot7\equiv1\pmod{26}$, that is, $7^{-1}\equiv-11\equiv15\pmod{26}$.`,
          R`Check: $7\cdot15=105=4\cdot26+1$.`
        ],
        answer: R`$7^{-1}\equiv15\pmod{26}$`
      },
      {
        title: 'Remainder of a large power',
        problem: R`What is the remainder of $3^{100}$ modulo $7$?`,
        steps: [
          R`$7$ is prime and $7\nmid3$, so by Fermat's little theorem $3^{6}\equiv1\pmod7$.`,
          R`Divide the exponent by $6$ with remainder: $100=16\cdot6+4$.`,
          R`Hence $3^{100}=(3^6)^{16}\cdot3^4\equiv1^{16}\cdot3^4=81\pmod7$.`,
          R`$81=11\cdot7+4$, so $3^{100}\equiv4\pmod7$.`
        ],
        answer: R`$3^{100}\equiv4\pmod7$`
      },
      {
        title: 'Computing a combination',
        problem: R`In how many ways can we choose $3$ people out of $7$?`,
        steps: [
          R`Order does not matter and repetition is not allowed, so this is a combination: $\binom73$.`,
          R`$\binom73=\dfrac{7!}{3!\,4!}$.`,
          R`Simplifying: $\dfrac{7\cdot6\cdot5}{3\cdot2\cdot1}=35$.`
        ],
        answer: R`$\binom73=35$`
      }
    ],
    mistakes: [
      R`Dividing by an arbitrary number in a congruence; one may divide only by a factor relatively prime to the modulus.`,
      R`Using Fermat's little theorem for a non-prime modulus; there only Euler's theorem holds, with exponent $\varphi(m)$.`,
      R`Confusing combinations and variations: if the order of selection matters, a variation is needed.`,
      R`In inclusion-exclusion subtracting the intersections but not adding the triple intersection back (in the case of three sets).`
    ],
    exercises: [
      {
        q: R`What is $\gcd(252,105)$?`,
        hint: R`$252=2\cdot105+42$, then continue.`,
        sol: R`$252=2\cdot105+42$; $105=2\cdot42+21$; $42=2\cdot21+0$, hence $\gcd=21$.`
      },
      {
        q: R`What is the inverse of $7$ modulo $26$?`,
        hint: R`Find the $x$ for which $7x\equiv1\pmod{26}$.`,
        sol: R`$7\cdot15=105=4\cdot26+1$, hence $7^{-1}\equiv15\pmod{26}$.`
      },
      {
        q: R`What is the remainder of $2^{100}$ modulo $13$?`,
        hint: R`$13$ is prime, so $2^{12}\equiv1\pmod{13}$; $100=8\cdot12+4$.`,
        sol: R`$2^{100}\equiv2^4=16\equiv3\pmod{13}$.`
      },
      {
        q: R`What is $\binom{10}{3}$?`,
        hint: R`$\frac{10\cdot9\cdot8}{3\cdot2\cdot1}$.`,
        sol: R`$\frac{720}{6}=120$.`
      },
      {
        q: R`In how many ways can $5$ people sit down on a bench?`,
        hint: R`Permutation: $5!$.`,
        sol: R`$5!=120$.`
      },
      {
        q: R`How many positive integers not greater than $100$ are divisible by neither $2$ nor $3$?`,
        hint: R`Inclusion-exclusion: $100-|A\cup B|$, where $A$ is the set of even numbers and $B$ the set of multiples of $3$.`,
        sol: R`$|A|=50$, $|B|=33$, $|A\cap B|=16$ (the multiples of $6$). $|A\cup B|=50+33-16=67$, so the answer is $100-67=33$.`
      },
      {
        q: R`Solve: $3x\equiv5\pmod7$. Give the smallest nonnegative solution!`,
        hint: R`The inverse of $3$ modulo $7$ is $5$.`,
        sol: R`$3^{-1}\equiv5$, so $x\equiv5\cdot5=25\equiv4\pmod7$. Check: $3\cdot4=12=7+5$.`
      },
      {
        q: R`Prove that among any $n+1$ distinct integers chosen from the set $\{1,2,\dots,2n\}$ there are two that are relatively prime.`,
        hint: R`Order the numbers and use the pigeonhole principle: the $2n$ numbers form $n$ pairs $(1,2),(3,4),\dots$.`,
        sol: R`Split the $2n$ numbers into $n$ pairs: $\{1,2\},\{3,4\},\dots,\{2n-1,2n\}$. By the pigeonhole principle, two of the $n+1$ chosen numbers fall into the same pair, hence they are two consecutive integers. Two consecutive integers are relatively prime, because any common divisor divides their difference, which is $1$.`
      }
    ],
    video: {
      title: 'Number theory and combinatorics basics',
      channel: 'Hungarian mathematics channels'
    }
  };

  MB.enContent['diszkret/grafok'] = {
    title: 'Graphs',
    lead: 'A graph is a set of vertices and edges — in other words, the abstraction of any network. Degree, connectivity and cycles let every graph-theoretic theorem be reduced to a few elementary counts.',
    summary: 'Graph models and the basic theorems: degree sum and the handshake lemma, paths and cycles, trees, complete and bipartite graphs, and the Euler circuit criterion.',
    why: [
      R`A graph is a useful model because it preserves the structure of connections, not the geometry. A route planner, a social network or a circuit diagram can all be described with the same notion: vertices and edges. The degree measures how many edges enter a vertex; by the handshake lemma the sum of the degrees is $2|E|$, because every edge increases the degree at both endpoints by one. It follows immediately that the sum of the degrees is even, hence the number of odd-degree vertices is also even. This theorem alone settles many "does such a graph exist" problems.`,
      R`Connectivity means that a path leads between any two vertices. A tree is the simplest connected graph: it contains no cycle, so it has exactly one fewer edge than vertices. If a connected graph contains a cycle, an edge of that cycle can be removed without disconnecting it — this is why trees are the minimal connected graphs. In a complete graph every vertex is connected to every other, so on $n$ vertices it has $\binom n2$ edges.`,
      R`An Euler circuit is a closed walk that traverses every edge exactly once. The condition is simple and complete: the graph is connected and every degree is even. At an odd-degree vertex one cannot "enter and leave" the same number of times, so the circuit breaks. For bipartite graphs the key is the odd cycle: the edges of a bipartite graph run between two parts, so every cycle must have even length; conversely, if there is no odd cycle, the graph can be colored with two colors.`
    ],
    when: 'We use a graph model in every network problem: shortest path, connectivity, cycle detection, scheduling. On the exam (ZH) the handshake lemma, the number of edges of trees and of the complete graph, and the criterion for an Euler circuit are the most common questions; in proofs, summing degrees and induction are the two main tools.',
    theory: [
      {
        title: 'Simple graph, degree',
        body: R`A simple graph is $G=(V,E)$, where $V$ is the set of vertices (points) and $E$ is a set of two-element subsets: the edges. Simple means that there is no loop and no two edges between the same pair of vertices. The degree of a vertex $v$ is $d(v)$: the number of edges incident to $v$.`
      },
      {
        title: 'Handshake lemma',
        body: R`For every graph
$$\sum_{v\in V}d(v)=2|E|.$$
Consequence: the sum of the degrees is even, so the number of odd-degree vertices is always even.`
      },
      {
        title: 'Path, cycle, connectivity',
        body: R`A path is a sequence of vertices and edges in which consecutive vertices are joined by an edge and no vertex is repeated. A cycle is a path that returns to the same vertex. A graph is connected if a path leads between any two vertices. A vertex is isolated if its degree is zero.`
      },
      {
        title: 'Trees',
        body: R`A tree is a connected graph without cycles. For every tree on $n$ vertices
$$|E|=n-1.$$
Conversely: if a graph is connected and $|E|=n-1$, then it is a tree; if it is cycle-free and $|E|=n-1$, then it is connected. Every tree with at least two vertices has at least two vertices of degree one (leaves).`
      },
      {
        title: 'Complete graph, bipartite graph',
        body: R`In the complete graph $K_n$ every pair of vertices is joined, so $|E|=\binom n2=\frac{n(n-1)}2$. A graph is bipartite if its vertices can be split into two classes ($A$ and $B$) such that every edge runs between $A$ and $B$. The complete bipartite graph $K_{m,n}$ has $m\cdot n$ edges.`
      },
      {
        title: 'Euler circuit and Euler trail',
        body: R`A connected graph has an Euler circuit (a closed walk traversing every edge exactly once) exactly when every vertex has even degree. An Euler trail (not closed, traversing every edge exactly once) exists exactly when at most two vertices have odd degree.`
      },
      {
        title: 'Characterization of bipartite graphs',
        body: R`A graph is bipartite exactly when it contains no cycle of odd length. Hence $C_5$ (a pentagon) is not bipartite, while $C_4$ and $C_6$ are. It also follows that the vertices of a bipartite graph can be colored with two colors so that adjacent vertices have different colors.`
      },
      {
        title: 'Confusing Euler and Hamilton',
        body: R`An Euler circuit walks along edges once, a Hamilton circuit visits vertices once. The condition for an Euler circuit is simple and complete (even degrees); there is no such simple necessary and sufficient condition for the existence of a Hamilton circuit. Connectivity is necessary for both; neither can exist with an isolated vertex.`
      }
    ],
    examples: [
      {
        title: 'Odd degree sum — does such a graph exist?',
        problem: R`Does there exist a simple graph with $5$ vertices in which every vertex has degree $3$?`,
        steps: [
          R`In this case the sum of the degrees is $5\cdot3=15$, which is odd.`,
          R`By the handshake lemma the sum must equal $2|E|$, so it must be even.`,
          R`Contradiction: $15$ cannot equal $2|E|$.`,
          R`Therefore no such graph exists. (This is the same question as whether the degree sequence "three five times" is graphical.)`
        ],
        answer: R`It does not exist, because the sum of the degrees is $15$, which is odd`
      },
      {
        title: 'Number of edges of a tree',
        problem: R`How many edges does a tree on $n$ vertices have, and why?`,
        steps: [
          R`By induction: for $n=1$ there are no edges, and $n-1=0$.`,
          R`Every tree with at least two vertices has a leaf. Removing the leaf and its edge leaves a tree on $n-1$ vertices.`,
          R`By the induction hypothesis this tree has $n-2$ edges.`,
          R`Putting the removed edge back: $|E|=(n-2)+1=n-1$.`
        ],
        answer: R`$|E|=n-1$`
      },
      {
        title: 'Euler circuit for $K_5$ and $K_4$',
        problem: R`Which one has an Euler circuit: $K_5$ or $K_4$?`,
        steps: [
          R`In $K_5$ every vertex has degree $4$ (it is joined to every other vertex), which is even.`,
          R`$K_5$ is connected, so every condition holds: it has an Euler circuit.`,
          R`In $K_4$ every vertex has degree $3$, which is odd.`,
          R`There are four odd-degree vertices, so there is no Euler circuit; an Euler trail is also impossible (at most two vertices could have odd degree). The edges of $K_4$ can be split into two Euler trails.`
        ],
        answer: R`$K_5$ has an Euler circuit, $K_4$ does not (all four of its vertices have odd degree)`
      },
      {
        title: 'Bipartite graph and odd cycle',
        problem: R`Is the pentagon $C_5$ bipartite? And the hexagon $C_6$?`,
        steps: [
          R`$C_5$ is a cycle of length $5$, which is odd.`,
          R`In a bipartite graph every cycle has even length, because the cycle alternates between the two classes and can return to the same class only after an even number of steps.`,
          R`Therefore $C_5$ is not bipartite.`,
          R`The hexagon $C_6$ can be split into the vertices with even and odd indices; its edges run only between the two classes, so it is bipartite.`
        ],
        answer: R`$C_5$ is not bipartite, because it is an odd cycle; $C_6$ is bipartite`
      }
    ],
    mistakes: [
      R`Taking the sum of the degrees to be $|E|$; correctly it is $2|E|$.`,
      R`Using the formula $|E|=n$ for trees instead of $n-1$.`,
      R`Looking for an Euler circuit even when the graph is not connected — connectivity is a necessary condition.`,
      R`Believing that every cycle-free graph is a tree; a tree must also be connected.`
    ],
    exercises: [
      {
        q: R`How many edges does the complete graph $K_6$ have?`,
        hint: R`$\binom62$.`,
        sol: R`$6\cdot5/2=15$.`
      },
      {
        q: R`How many edges does a tree on $10$ vertices have?`,
        hint: R`$n-1$.`,
        sol: R`$|E|=10-1=9$.`
      },
      {
        q: R`A graph has $8$ edges. What is the sum of its degrees?`,
        hint: R`Handshake lemma.`,
        sol: R`$\sum d(v)=2|E|=16$.`
      },
      {
        q: R`Which one has an Euler circuit?`,
        choices: ['$K_5$', '$K_4$', 'Neither'],
        sol: R`In $K_5$ every degree is $4$ (even), so it has an Euler circuit; in $K_4$ every degree is $3$ (odd), so it does not.`
      },
      {
        q: R`Is the hexagon $C_6$ a bipartite graph?`,
        choices: ['Yes', 'No'],
        sol: R`Yes: the vertices can be split into two classes according to even/odd index, and every edge runs between the two classes.`
      },
      {
        q: R`How many edges does the complete bipartite graph $K_{3,4}$ have?`,
        hint: R`$m\cdot n$.`,
        sol: R`$3\cdot4=12$.`
      },
      {
        q: R`Prove that if a graph has exactly two odd-degree vertices, then every Euler trail starts and ends at these two vertices.`,
        hint: R`At every internal vertex of the trail we enter as many times as we leave.`,
        sol: R`An Euler trail traverses every edge exactly once. At every internal vertex the incoming and outgoing edges can be paired, so the degree of an internal vertex is even. At the two endpoints of the trail the degree is odd (one more outgoing edge at the start, one more incoming edge at the end). Since there are only two odd-degree vertices, they must be the endpoints.`
      },
      {
        q: R`Prove that every tree with at least two vertices has at least two vertices of degree one.`,
        hint: R`Start from a vertex along a longest path; at its end one cannot continue.`,
        sol: R`Take a longest simple path $P$ in the tree, with endpoints $u$ and $v$. If $u$ had a neighbor outside $P$, the path could be extended; if $u$ had another neighbor on $P$, there would be a cycle. Hence the degree of $u$ is $1$. The same holds for $v$, so there are at least two leaves.`
      },
      {
        q: R`How many edges does a graph have if it has $6$ vertices and every vertex has degree $2$?`,
        hint: R`First the degree sum, then $|E|$.`,
        sol: R`$\sum d(v)=12$, so $|E|=12/2=6$.`
      }
    ],
    video: {
      title: 'Graph theory basics',
      channel: 'Hungarian mathematics channels'
    }
  };
})();
