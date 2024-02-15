// components/ui/Button/Button.stories.tsx
import { faSparkles } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from '@radix-ui/themes';
import { HttpResponse, http } from "msw";

export default {
  title: 'UI/Button',
  component: Button,
};

export const SuccessBehavior = () => <Button onClick={
  async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    console.log(data);
  }
}>
  <FontAwesomeIcon icon={faSparkles} />
</Button>

SuccessBehavior.parameters = {
  msw: {
    handlers: [
      http.get("/api/users", () => {
        return HttpResponse.json([
          {
            id: 1,
            name: "anson",
          },
        ]);
      }),
    ]
  },
}
