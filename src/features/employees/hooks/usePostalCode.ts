import { useState } from "react";

type AddressResult = {
  prefecture: string;
  city: string;
  town: string;
};

export function usePostalCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAddress = async (postalCode: string): Promise<AddressResult | null> => {
    const code = postalCode.replace("-", "").trim();

    if (code.length !== 7) {
      setError("郵便番号は7桁で入力してください");
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`
      );
      const data = await res.json();

      if (!data.results) {
        setError("該当する住所が見つかりませんでした");
        return null;
      }

      const result = data.results[0];
      return {
        prefecture: result.address1,
        city: result.address2,
        town: result.address3,
      };
    } catch {
      setError("住所の検索に失敗しました");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchAddress, loading, error };
}
