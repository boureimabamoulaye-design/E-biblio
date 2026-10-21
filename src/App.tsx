import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createClient, User } from '@supabase/supabase-js'
import { Home, Search, LibraryBig, UserRound, BookOpen, Heart, Star, ChevronRight, X, Menu, LogOut, Bookmark, SlidersHorizontal } from 'lucide-react'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const supabase = url && anonKey ? createClient(url, anonKey) : null

type Book = { id:number; title:string; author:string; genre:string; rating:string; cover:string; description:string; pages:number }
const books: Book[] = [
 {id:1,title:'Le Petit Prince',author:'Antoine de Saint-Exupéry',genre:'Classique',rating:'4.9',cover:'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg',description:'Un conte poétique sur l’amitié, l’amour et ce qui compte vraiment.',pages:96},
 {id:2,title:'Orgueil et Préjugés',author:'Jane Austen',genre:'Romance',rating:'4.8',cover:'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',description:'Un classique sur l’amour, les premières impressions et les conventions sociales.',pages:432},
 {id:3,title:'Alice au pays des merveilles',author:'Lewis Carroll',genre:'Fantaisie',rating:'4.7',cover:'https://covers.openlibrary.org/b/isbn/9780141321073-L.jpg',description:'Suivez Alice dans un monde étrange où l’imagination ne connaît aucune limite.',pages:208},
 {id:4,title:'Le Tour du monde en 80 jours',author:'Jules Verne',genre:'Aventure',rating:'4.6',cover:'https://covers.openlibrary.org/b/isbn/9780140449068-L.jpg',description:'Un pari audacieux entraîne Phileas Fogg dans une course contre la montre.',pages:256},
 {id:5,title:'Frankenstein',author:'Mary Shelley',genre:'Classique',rating:'4.5',cover:'https://covers.openlibrary.org/b/isbn/9780486282114-L.jpg',description:'Un récit gothique sur la science, la responsabilité et la solitude.',pages:280},
 {id:6,title:'James et la grosse pêche',author:'Roald Dahl',genre:'Aventure',rating:'4.6',cover:'https://covers.openlibrary.org/b/isbn/9780141365454-L.jpg',description:'Une aventure merveilleuse, pleine de rencontres surprenantes et de fantaisie.',pages:160},
 {id:7,title:'Les Misérables',author:'Victor Hugo',genre:'Classique',rating:'4.7',cover:'https://covers.openlibrary.org/b/isbn/9780451419439-L.jpg',description:'Une grande fresque humaine autour de la justice, de la rédemption et de l’espoir.',pages:1463},
 {id:8,title:'Le Magicien d’Oz',author:'L. Frank Baum',genre:'Fantaisie',rating:'4.6',cover:'https://covers.openlibrary.org/b/isbn/9780141321028-L.jpg',description:'Dorothy part pour un voyage merveilleux à la recherche du chemin du retour.',pages:192}
]
type Tab = 'Accueil'|'Recherche'|'Bibliothèque'|'Compte'
const tabs = [{name:'Accueil' as Tab,Icon:Home},{name:'Recherche' as Tab,Icon:Search},{name:'Bibliothèque' as Tab,Icon:LibraryBig},{name:'Compte' as Tab,Icon:UserRound}]
export default function App(){
 const [tab,setTab]=useState<Tab>('Accueil')
 const [query,setQuery]=useState('')
 const [genre,setGenre]=useState('Tous')
 const [favorites,setFavorites]=useState<number[]>([1])
 const [saved,setSaved]=useState<number[]>([1,3])
 const [progress,setProgress]=useState<Record<number,number>>({1:35,3:70})
 const [selected,setSelected]=useState<Book|null>(null)
 const [reader,setReader]=useState<Book|null>(null)
 const [authOpen,setAuthOpen]=useState(false)
 const [authMode,setAuthMode]=useState<'signup'|'signin'>('signup')
 const [name,setName]=useState('')
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [message,setMessage]=useState('')
 const [busy,setBusy]=useState(false)
 const [user,setUser]=useState<User|null>(null)
 const [mobileMenu,setMobileMenu]=useState(false)
 useEffect(()=>{ if(!supabase)return; supabase.auth.getUser().then(({data})=>setUser(data.user)); const {data}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null)); return ()=>data.subscription.unsubscribe() },[])
 const filtered=useMemo(()=>books.filter(b=>(genre==='Tous'||genre===b.genre)&&`${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(query.toLowerCase())),[genre,query])
 const visible=tab==='Bibliothèque'?books.filter(b=>saved.includes(b.id)):filtered
 const nav=(t:Tab)=>{setTab(t);setMobileMenu(false)}
 const toggle=(id:number,values:number[],set:(v:number[])=>void)=>set(values.includes(id)?values.filter(x=>x!==id):[...values,id])
 const submitAuth=async(e:FormEvent<HTMLFormElement>)=>{
   e.preventDefault();setMessage('')
   if(!supabase){setMessage('Configurez d’abord VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env pour activer les comptes réels.');return}
   if(password.length<8){setMessage('Le mot de passe doit contenir au moins 8 caractères.');return}
   setBusy(true)
   try{
     if(authMode==='signup'){
       const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,role:'student'}}})
       if(error)throw error
       setMessage(data.session?'Compte étudiant créé avec succès.':'Inscription envoyée ! Consultez votre e-mail pour confirmer votre compte.')
       if(data.session){setUser(data.user);setAuthOpen(false)}
     }else{
       const {data,error}=await supabase.auth.signInWithPassword({email,password})
       if(error)throw error
       setUser(data.user);setAuthOpen(false)
     }
   }catch(err){setMessage(err instanceof Error?err.message:'Une erreur est survenue. Réessayez.')}
   finally{setBusy(false)}
 }
 const signOut=async()=>{if(supabase)await supabase.auth.signOut();setUser(null);setTab('Accueil')}
 return <div className="app">
  <aside className={`sidebar ${mobileMenu?'open':''}`}>
   <div className="brand"><span className="brand-icon"><BookOpen size={22}/></span><span>Biblio<span>Livre</span></span><button className="close-side" onClick={()=>setMobileMenu(false)} aria-label="Fermer le menu"><X/></button></div>
   <p className="side-label">MENU PRINCIPAL</p>
   {tabs.map(({name:n,Icon})=><button key={n} className={`nav-item ${tab===n?'active':''}`} onClick={()=>n==='Compte'?(nav('Compte'),setAuthOpen(true)):nav(n)}><Icon size={19}/><span>{n}</span>{n==='Bibliothèque'&&<small>{saved.length}</small>}</button>)}
   <div className="side-bottom"><div className="side-promo"><BookOpen size={23}/><b>Une histoire vous attend</b><p>Explorez le catalogue et trouvez votre prochaine lecture.</p><button onClick={()=>nav('Recherche')}>Explorer <ChevronRight size={14}/></button></div><button className="account-side" onClick={()=>{setAuthMode(user?'signin':'signup');setAuthOpen(true)}}><span className="avatar">{user?.email?.[0]?.toUpperCase()||'É'}</span><span><b>{user?.user_metadata?.full_name||user?.email||'Espace étudiant'}</b><small>{user?'Compte connecté':'Créer un compte gratuit'}</small></span><ChevronRight size={16}/></button></div>
  </aside>
  {mobileMenu&&<button className="scrim" aria-label="Fermer le menu" onClick={()=>setMobileMenu(false)}/>}
  <main className="main">
   <header className="topbar"><button className="menu-button" onClick={()=>setMobileMenu(true)} aria-label="Ouvrir le menu"><Menu/></button><div className="crumb">BiblioLivre <span>/</span> <b>{tab}</b></div><button className="account-button" onClick={()=>{setAuthMode(user?'signin':'signup');setAuthOpen(true)}}><span className="avatar">{user?.email?.[0]?.toUpperCase()||'É'}</span><span>{user?'Mon compte':'Créer un compte'}</span><ChevronRight size={15}/></button></header>
   {tab==='Compte'?<section className="account-page"><span className="eyebrow">ESPACE ÉTUDIANT</span><h1>{user?'Votre compte étudiant':'Bienvenue sur BiblioLivre'}</h1><p>{user?`Connecté avec ${user.email}`:'Créez un compte gratuit pour retrouver votre bibliothèque et votre progression.'}</p><div className="account-card"><div className="account-illustration"><BookOpen size={38}/></div><h2>{user?'Bonne lecture !':'Votre bibliothèque vous suit partout'}</h2><p>{user?'Votre compte étudiant est actif.':'Inscrivez-vous avec votre nom, votre e-mail et un mot de passe.'}</p>{user?<button className="primary" onClick={signOut}><LogOut size={16}/> Se déconnecter</button>:<button className="primary" onClick={()=>{setAuthMode('signup');setAuthOpen(true)}}>Créer mon compte étudiant</button>}</div></section>:
   <>
    <section className="welcome"><div><span className="eyebrow">{tab==='Bibliothèque'?'VOTRE COLLECTION':tab==='Recherche'?'LE CATALOGUE':'LE PLAISIR DE LIRE'}</span><h1>{tab==='Bibliothèque'?'Ma bibliothèque':tab==='Recherche'?'Quel livre vous tente ?':'Des histoires à vivre.'}</h1><p>{tab==='Bibliothèque'?'Tous vos livres enregistrés au même endroit.':'Découvrez des livres, explorez de nouveaux univers et lisez à votre rythme.'}</p></div><div className="welcome-icon"><BookOpen size={30}/><span>Lire · Rêver · Découvrir</span></div></section>
    {tab==='Accueil'&&<section className="hero"><div className="hero-text"><span className="hero-label">✦ SÉLECTION DU MOMENT</span><h2>Ouvrez un livre.<br/>Ouvrez un monde.</h2><p>Des classiques intemporels aux nouvelles découvertes, votre prochaine aventure commence ici.</p><button className="hero-btn" onClick={()=>nav('Recherche')}>Découvrir les livres <ChevronRight size={16}/></button></div><img className="hero-cover" src={books[0].cover} alt="Couverture du Petit Prince"/></section>}
    {tab!=='Bibliothèque'&&<div className="search-box"><Search size={18}/><input value={query} onChange={e=>{setQuery(e.target.value);if(e.target.value)setTab('Recherche')}} placeholder="Titre, auteur ou genre…" aria-label="Rechercher un livre"/><button onClick={()=>setGenre(genre==='Tous'?'Classique':'Tous')}><SlidersHorizontal size={16}/><span>Filtres</span></button></div>}
    <section className="catalog"><div className="section-head"><div><h2>{tab==='Bibliothèque'?'Livres enregistrés':query?'Résultats':'À découvrir'}</h2><p>{visible.length} livre(s) dans cette sélection</p></div>{tab!=='Bibliothèque'&&<button className="see-all" onClick={()=>nav('Recherche')}>Tout voir <ChevronRight size={15}/></button>}</div>
     <div className="filters">{['Tous','Classique','Romance','Fantaisie','Aventure'].map(g=><button key={g} className={genre===g?'chosen':''} onClick={()=>setGenre(g)}>{g}</button>)}<span className="free-label"><i/> Catalogue gratuit</span></div>
     {visible.length===0?<div className="empty"><BookOpen size={30}/><h3>Aucun livre trouvé</h3><p>Essayez un autre mot ou une autre catégorie.</p><button className="secondary" onClick={()=>{setQuery('');setGenre('Tous')}}>Réinitialiser</button></div>:<div className="book-grid">{visible.map(b=><article className="book-card" key={b.id}><button className="cover" onClick={()=>setSelected(b)} aria-label={`Voir ${b.title}`}><img src={b.cover} alt={`Couverture de ${b.title}`} onError={e=>{e.currentTarget.src=`https://placehold.co/240x340/F1E7D2/5A4426?text=${encodeURIComponent(b.title)}`}}/><span className="free-tag">GRATUIT</span></button><button className={`heart ${favorites.includes(b.id)?'hearted':''}`} onClick={()=>toggle(b.id,favorites,setFavorites)} aria-label="Ajouter aux favoris"><Heart size={15} fill={favorites.includes(b.id)?'currentColor':'none'}/></button><div className="book-info"><span className="genre">{b.genre}</span><h3><button onClick={()=>setSelected(b)}>{b.title}</button></h3><p>{b.author}</p><div className="book-meta"><span><Star size={12} fill="currentColor"/> {b.rating}</span><span>{b.pages} p.</span></div><button className="details-link" onClick={()=>setSelected(b)}>Détails <ChevronRight size={13}/></button></div></article>)}</div>}
    </section>
    {tab==='Accueil'&&<section className="continue"><div className="section-head"><div><h2>Continuer la lecture</h2><p>Reprenez là où vous vous êtes arrêté.</p></div><button className="see-all" onClick={()=>nav('Bibliothèque')}>Ma bibliothèque <ChevronRight size={15}/></button></div><div className="continue-grid">{books.filter(b=>(progress[b.id]||0)>0).slice(0,2).map(b=><div className="continue-card" key={b.id}><img src={b.cover} alt=""/><div className="continue-copy"><b>{b.title}</b><small>{b.author}</small><div className="progress"><span style={{width:`${progress[b.id]}%`}}/></div><small>{progress[b.id]} % lu</small></div><button onClick={()=>{setReader(b);setProgress(p=>({...p,[b.id]:Math.min(100,(p[b.id]||0)+10)}))}} aria-label="Continuer la lecture"><ChevronRight size={17}/></button></div>)}</div></section>}
   </>}
   <footer><span>© 2026 BiblioLivre</span><span>Un livre, mille horizons.</span><span>Prototype React</span></footer>
  </main>
  <nav className="bottom-nav" aria-label="Navigation mobile">{tabs.map(({name:n,Icon})=><button key={n} className={tab===n?'active':''} onClick={()=>n==='Compte'?(nav('Compte'),setAuthMode(user?'signin':'signup'),setAuthOpen(true)):nav(n)}><Icon size={20}/><span>{n}</span></button>)}</nav>
  {selected&&<div className="overlay" onClick={()=>setSelected(null)}><section className="book-modal" onClick={e=>e.stopPropagation()}><button className="close-modal" onClick={()=>setSelected(null)} aria-label="Fermer"><X/></button><img src={selected.cover} alt="" className="modal-cover"/><div className="modal-copy"><span className="genre">{selected.genre} · ★ {selected.rating}</span><h2>{selected.title}</h2><p className="author">Par {selected.author}</p><p>{selected.description}</p><p className="pages"><BookOpen size={15}/> {selected.pages} pages <span>• Gratuit*</span></p><button className="primary" onClick={()=>{setReader(selected);setSelected(null);setProgress(p=>({...p,[selected.id]:Math.min(100,(p[selected.id]||0)+10)}))}}><BookOpen size={16}/> Lire un aperçu</button><button className="secondary full" onClick={()=>toggle(selected.id,saved,setSaved)}><Bookmark size={15}/>{saved.includes(selected.id)?'Retirer de ma bibliothèque':'Ajouter à ma bibliothèque'}</button><small className="rights">* Vérifiez les droits de diffusion avant de publier les fichiers complets.</small></div></section></div>}
  {reader&&<div className="reader"><header><button className="secondary" onClick={()=>setReader(null)}><X size={16}/> Fermer</button><b>{reader.title}</b><BookOpen size={19}/></header><article><span className="eyebrow">APERÇU DE LECTURE</span><h1>{reader.title}</h1><p className="author">par {reader.author}</p><hr/><p>Il était une fois, une histoire qui attendait simplement que quelqu’un l’ouvre. Chaque page est une porte vers un autre monde, une autre époque, une autre façon de regarder les choses.</p><p>La lecture nous permet de voyager sans quitter notre fauteuil, de rencontrer des personnages inoubliables et de découvrir des idées qui nous accompagnent longtemps après la dernière page.</p><button className="primary" onClick={()=>setProgress(p=>({...p,[reader.id]:Math.min(100,(p[reader.id]||0)+10)}))}>Page suivante <ChevronRight size={16}/></button><small className="rights">Aperçu de démonstration : le lecteur PDF/EPUB sera connecté aux fichiers autorisés dans une prochaine étape.</small></article></div>}
  {authOpen&&<div className="overlay" onClick={()=>setAuthOpen(false)}><section className="auth-modal" onClick={e=>e.stopPropagation()}><button className="close-modal" onClick={()=>setAuthOpen(false)} aria-label="Fermer"><X/></button><span className="brand-icon"><BookOpen size={24}/></span><span className="eyebrow">ESPACE ÉTUDIANT GRATUIT</span><h2>{authMode==='signup'?'Créer mon compte':'Se connecter'}</h2><p>{authMode==='signup'?'Rejoignez BiblioLivre pour sauvegarder vos livres et votre progression.':'Connectez-vous pour retrouver votre bibliothèque.'}</p><form onSubmit={submitAuth}>{authMode==='signup'&&<label>Nom complet<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. Aïssata Traoré" autoComplete="name" required/></label>}<label>Adresse e-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="email" required/></label><label>Mot de passe<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8 caractères minimum" minLength={8} autoComplete={authMode==='signup'?'new-password':'current-password'} required/></label><button className="primary" type="submit" disabled={busy}>{busy?'Veuillez patienter…':authMode==='signup'?'Créer mon compte étudiant':'Se connecter'}</button></form>{message&&<p className="auth-message" role="status">{message}</p>}<button className="switch-auth" onClick={()=>{setAuthMode(authMode==='signup'?'signin':'signup');setMessage('')}}>{authMode==='signup'?'Déjà inscrit ? Se connecter':'Pas encore de compte ? Créer un compte'}</button>{!supabase&&<small className="setup-note">Pour activer l'inscription réelle, configurez Supabase avec les étapes du README.</small>}</section></div>}
 </div>
}
