import React, { useMemo, useState } from 'react';

// Simple emoji picker: searchable grid, passes selected emoji to onSelect
export default function EmojiPicker({ onSelect, columns = 8 }) {
  const [query, setQuery] = useState('');

  const EMOJIS = useMemo(() => ([
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
    '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥',
    '😴','🤤','😪','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦',
    '😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','😤','😡','😠','🤬','👋','🤚','🖐️',
    '✋','🖖','👌','✌️','🤞','🤟','🤘','🤙','👍','👎','👊','✊','👏','🙌','🙏','💪','💃','🕺','👯','🧑‍🤝‍🧑',
    '❤️','💛','💚','💙','💜','🖤','💔','💕','💞','💓','💗','💖','💘','💝','✨','⭐','🔥','🌟','🎉','🎊',
    '🎁','🎈','🎂','🍰','🍪','🍩','☕','🍺','🍷','🥂','🍾','🍕','🍔','🍟','🌮','🌯','🥗','🍎','🍌','🍓',
    '⚽','🏀','🏈','🎾','🏐','🏓','🏸','🎯','🎲','🎵','🎶','🎤','🎧','🎷','🎸','🪕','🎺','🥁','📣','📯'
  ]), []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMOJIS;
    return EMOJIS.filter(e => e.includes(q));
  }, [EMOJIS, query]);

  return (
    <div className="p-2">
      <input className="w-full mb-2 px-2 py-1 border rounded" placeholder="Buscar emoji (ej. 😂)" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(34px, 1fr))` }}>
        {list.map((em) => (
          <button key={em} onClick={() => onSelect(em)} className="p-1 text-2xl hover:bg-blue-50 rounded flex items-center justify-center select-none cursor-pointer">{em}</button>
        ))}
      </div>
    </div>
  );
}
