(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['logika/halmazok-logika'] = {
    title: 'Sets, logic, quantifiers',
    lead: 'Definitions are written with quantifiers, theorems are implications. If you know what "for all" and "there exists" mean and how to negate them, half of the limit definitions is already done.',
    summary: 'The minimum formal language of university mathematics: set notation, implication and its converse/contrapositive, quantifiers and their mechanical negation, and the direct, contrapositive and induction proof patterns.',
    why: [
      R`Mathematical statements use a formal language because everyday language is imprecise. The statement "every continuous function is differentiable" is false, and a single counterexample refutes it: $|x|$ is continuous but not differentiable at zero. Quantifiers say exactly what type of counterexample you have to look for.`,
      R`Negation is not a swap of words but a mechanical operation: $\forall$ turns into $\exists$, $\exists$ turns into $\forall$, the inner statement is negated, and and/or are interchanged. This is the routine that exams test on definitions.`
    ],
    when: 'Whenever a definition or a theorem is stated; when negating limits, continuity, differentiability and convergence; when deciding whether a proof should be direct, by contraposition or indirect.',
    theory: [
      { title: 'Set notation', body: R`$x\in H$: is an element of; $A\subseteq B$: subset; $A\cup B$: union; $A\cap B$: intersection; $A\setminus B$: difference; $\emptyset$: empty set. Number sets: $\mathbb N$ (natural), $\mathbb Z$ (integer), $\mathbb Q$ (rational), $\mathbb R$ (real), $\mathbb C$ (complex).` },
      { title: R`The meaning of $\mathbb N$ is not uniform`, body: R`In some courses $0\in\mathbb N$, in others it is not. On the exam the convention of that particular course always counts; if you are unsure, write down separately whether $n\ge1$ or $n\ge0$.` },
      { title: 'De Morgan identities', note: R`The same in logic: $\neg(A\land B)\iff\neg A\lor\neg B$, and $\neg(A\lor B)\iff\neg A\land\neg B$.` },
      { title: 'Implication', body: R`$A\Rightarrow B$ ("if $A$, then $B$") is false exactly when $A$ is true and $B$ is false. If $A$ is false, the implication is true — this is called vacuous truth. That is why $A\Rightarrow B$ is equivalent to the statement $\neg A\lor B$.` },
      { title: 'Related statements', items: [
        R`Converse: $B\Rightarrow A$ — not equivalent to the original.`,
        R`Contrapositive: $\neg B\Rightarrow\neg A$ — equivalent to the original.`,
        R`Negation: $\neg(A\Rightarrow B)\iff A\land\neg B$.`
      ] },
      { title: 'Quantifiers', body: R`$\forall x\in H:P(x)$: $P(x)$ is true for every $x$ in $H$. $\exists x\in H:P(x)$: there is an $x$ in $H$ for which $P(x)$ is true. Under negation the quantifier flips: $\neg(\forall x:P(x))\iff\exists x:\neg P(x)$, and $\neg(\exists x:P(x))\iff\forall x:\neg P(x)$.` },
      { title: 'The order of the quantifiers matters', body: R`$\forall x\exists y:y>x$ is true on $\mathbb R$ (every number has a larger one). But $\exists y\forall x:y>x$ is false (there is no real number larger than every number). The same distinction will separate pointwise continuity from uniform continuity.` },
      { title: 'Negating convergence', body: R`Convergence: $\forall\varepsilon>0\ \exists N\ \forall n>N:|a_n-A|<\varepsilon$. Its negation, step by step: $\exists\varepsilon>0\ \forall N\ \exists n>N:|a_n-A|\ge\varepsilon$. In words: there is an error threshold such that however large a cutoff you pick, there is always a term beyond it that is at least that far from $A$.` },
      { title: 'Number of elements of sets', note: R`For three sets, inclusion-exclusion: $|A\cup B\cup C|=|A|+|B|+|C|-|A\cap B|-|A\cap C|-|B\cap C|+|A\cap B\cap C|$.` }
    ],
    examples: [
      {
        title: 'Negating quantifiers',
        problem: R`Negate: "every continuous function is differentiable".`,
        steps: [
          R`Formally: $\forall f\ (f\ \text{continuous}\Rightarrow f\ \text{differentiable})$.`,
          R`Its negation: $\exists f\ (f\ \text{continuous}\land f\ \text{not differentiable})$.`,
          R`Example: $f(x)=|x|$ is continuous but not differentiable at $0$.`
        ],
        answer: R`A single counterexample is enough: $f(x)=|x|$.`
      },
      {
        title: 'Induction',
        problem: R`Prove: $1+2+\dots+n=\dfrac{n(n+1)}2$ for every $n\ge1$.`,
        steps: [
          R`Base case ($n=1$): left-hand side $1$, right-hand side $1\cdot2/2=1$.`,
          R`Induction hypothesis: suppose $1+\dots+k=\frac{k(k+1)}2$.`,
          R`Induction step: $1+\dots+k+(k+1)=\frac{k(k+1)}2+(k+1)$.`,
          R`Common denominator: $\frac{k(k+1)+2(k+1)}2=\frac{(k+1)(k+2)}2$, which is the formula for $n=k+1$.`
        ],
        answer: R`The statement is true for every $n\ge1$.`
      },
      {
        title: 'Contraposition',
        problem: R`Prove: if $n^2$ is even, then $n$ is even.`,
        steps: [
          R`The contrapositive: if $n$ is odd, then $n^2$ is odd.`,
          R`Write $n=2k+1$.`,
          R`$n^2=4k^2+4k+1=2(2k^2+2k)+1$, which is odd.`,
          R`This proves the original implication as well.`
        ],
        answer: R`The statement is true.`
      }
    ],
    mistakes: [
      R`When negating, $\forall$ is not turned into $\exists$.`,
      R`Reversing the implication: concluding $B\Rightarrow A$ from $A\Rightarrow B$.`,
      R`In an induction proof the induction hypothesis is never used.`,
      R`Swapping the order of "for all" and "there exists".`
    ],
    exercises: [
      {
        q: R`Negate: $\forall x\in\mathbb R\ \exists y\in\mathbb R:y>x$.`,
        hint: R`The quantifiers flip and the inner statement is negated.`,
        sol: R`$\exists x\in\mathbb R\ \forall y\in\mathbb R:y\le x$. In words: there is a number that has nothing larger.`,
        altEn: ['∃x∈R ∀y∈R: y≤x', '∃x ∀y: y≤x', 'there is an x such that y≤x for every y']
      },
      {
        q: R`Negate: $\forall\varepsilon>0\ \exists N\ \forall n>N:|a_n-A|<\varepsilon$.`,
        hint: R`Four quantifiers, from the outside in.`,
        sol: R`$\exists\varepsilon>0\ \forall N\ \exists n>N:|a_n-A|\ge\varepsilon$.`,
        altEn: ['∃ε>0 ∀N ∃n>N: |aₙ-A|≥ε', '∃ε>0 ∀N ∃n>N:|an-A|≥ε']
      },
      {
        q: R`Prove directly: the sum of two odd numbers is even.`,
        sol: R`Let the two numbers be $2k+1$ and $2m+1$. Their sum is $2k+2m+2=2(k+m+1)$, which is divisible by $2$.`
      },
      {
        q: R`Prove by induction: $1+3+\dots+(2n-1)=n^2$.`,
        sol: R`Base case $n=1$: $1=1$. If $1+\dots+(2k-1)=k^2$, then adding $2k+1$: $k^2+2k+1=(k+1)^2$.`
      },
      {
        q: R`How many subsets does a set with $5$ elements have?`,
        hint: R`Every element is either in the subset or not.`,
        sol: R`$2^5=32$.`
      },
      {
        q: R`Is it true that $\exists y\in\mathbb R\ \forall x\in\mathbb R:x+y=0$?`,
        choices: ['True', 'False'],
        sol: R`False. Each $x$ would need its own $y=-x$; there is no single $y$ that works for every $x$.`
      }
    ],
    video: {
      title: 'Logic, quantifiers, proof methods',
      channel: 'Hungarian mathematics channels',
      note: 'Hungarian-language search: "matematikai logika kvantorok tagadás bizonyítási módszerek magyar". The videos found are in Hungarian.'
    }
  };
})();
