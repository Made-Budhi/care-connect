import { useState, useEffect } from "react";

const SociableInstagram = ({ embedId }: { embedId?: string }) => {
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    // Force iframe refresh when component mounts
    setIframeKey(prev => prev + 1);
  }, [embedId]);

  // IF embedID doesn't exist, Will show these message
  if (!embedId) {
    return (
      <div className="p-8 bg-gray-100 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Instagram Feed</h3>
        <p className="text-gray-500">Please configure your SociableKit embed ID</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <iframe 
        key={iframeKey}
        src={`https://widgets.sociablekit.com/instagram-feed/iframe/${embedId}`}
        width="100%" 
        height="800"
        style={{border: 'none'}}
        title="Instagram Feed"
        loading="lazy"
      />
    </div>
  );
};

export default SociableInstagram;