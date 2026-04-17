# Estrutura de Dados: DEF_DATA

O `DEF_DATA` é o objeto que define o estado inicial e a estrutura de dados completa do App Vida Flor (v11). Ele embasa o módulo global do estado, inicialização do `localStorage` e a hierarquia dos perfis.

## Regras do DEF_DATA

1.  **Imutabilidade do Schema Base:** O acesso no React deve ser protegido primariamente de null-accesses no tratamento da V1 de localStorage legados de usuários. O `DEF_DATA` ajuda o app a reconstruir pedaços perdidos e garante fail safes.
2.  **Hierarquia de Perfis Opcionais:** A estrutura da "v11" adotou `profiles` globais, unificando log de agua e controles de ciclo por perfis individuais em oposição do modelo antigo global.
3.  **Tipagem Implícita:** Os valores estáticos iniciais declarados no `DEF_DATA` atuam como guia das propriedades inerentes a cada branch (ex: finanças, espiritual, integrações).

## Estrutura Base do DEF_DATA (Vida Flor v11)

Abaixo está o map atual do DEF_DATA.

```javascript
const DEF_DATA = () => ({
  _v: 2,
  routine: {
    morning:   [{id:1,task:"Oração da manhã",time:"06:00"}],
    afternoon: [{id:5,task:"Almoço em família",time:"12:00"}],
    night:     [{id:9,task:"Devocional em família",time:"19:00"}],
    essential: [{id:101,task:"Oração"}],
    done: {},
    essMode: false,
  },
  
  health: {
    activeProfile: "eu", // Determina aba perfil em "Saúde" e afeta cálculos dependentes de `mainP`
    profiles: [
      {
        id: "eu",
        name: "Você",
        av: "👩",          // Avatar
        type: "adult_f",   // Tipo da pessoa ("adult_f" habilita ciclo)
        color: "#E8799A",
        water: { goal: 2000, log: {} }, // Onde a chave é data ISO (YYYY-MM-DD) e loga os ml diários
        cycle: { start: today(), len: 28, menses: 5 }, // Tracker do fluxo
        meds: [], // Array detalhado {id, nome, dosagem, frequency}
        notes: {}, // Record de saúde diário.
      },
    ],
  },
  
  finance: {
    transactions: [ // Tipos nativos: "income" | "expense" (com ou sem flag paid boolean e due)
      {id:1,desc:"Salário",val:8000,type:"income",cat:"💼 Salário CLT",date:today(),paid:true,cardId:null,installment:null},
    ],
    cards: [
      {id:1,name:"Nubank",brand:"Mastercard",color:"#8A05BE",closeDay:2,dueDay:10},
    ],
    budget: {}, // Orçamento limitador em YYYY-MM mapeados diretamente
  },
  
  spirit: { gratitude:{}, readings:[], prayers:[] },
  
  shopping: { items: [] }, // Subárea da Organiza {id, name, cat, done}
  notes: { list: [] },     // Controle de cor, id, blocknotes
  reminders: { list: [] }, // Data, hora e nível de urgência
  
  bloom: { points:{} },    // Cálculo flor dinâmica do dia baseando no esforço
  
  integrations: {
    google: {
      connected:false, email:"",
      calendars:[{id:"primary",name:"Pessoal",active:true}],
      events:[],
    },
  },
  
  kids: {
    children: [
      {id:1,name:"Ana", av:"👧",age:8,color:"#FF8FAB",tasks:[]},
    ],
    done:{},
  },
});
```

## Tratamento Anti-Crash em Ambientes Híbridos (Exemplo)

```javascript
/* Utiliza-se merge raso ou check local para resguardar a V1 que não contem o object branch completo da V2, na injeção via App.jsx: */

let d = DEF_DATA();
if (r?.value) {
    let loaded = JSON.parse(r.value);
    if(loaded.health && !loaded.health.profiles) {
        // Prepara migração V2 em health!
        loaded.health = d.health; 
    }
    d = loaded;
}
setDataRaw(d); 
```
