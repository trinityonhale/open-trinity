import { Card, Group, Badge, Text } from "@mantine/core";
import * as Model from "@/db/model";
import { QuestUrgency } from "@/db/constants";
import { Link } from "react-router-dom";

export default function QuestCard(props: { quest: Model.AnyQuest, id: string }) {
  const { quest, id } = props;

  enum QuestUrgencyColor {
    low = "green",
    medium = "orange",
    high = "red",
  }

  return (
    <Link to={`/quests/${id}`} style={{ textDecoration: 'none' }}>
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between">
        <Badge
          bg={
            QuestUrgencyColor[
              QuestUrgency[quest.urgency] as keyof typeof QuestUrgencyColor
            ]
          }
        >
          {QuestUrgency[quest.urgency]}
        </Badge>
        <Text c="dimmed" fz="sm">
          {quest.createdAt.toDate().toLocaleDateString()}
        </Text>
      </Group>

      <Text fz="lg" fw={500} mt="md">
        {quest.title}
      </Text>
      <Text fz="sm" c="dimmed" mt={5} lineClamp={5} h={108}>
        {quest.details.substring(0, 300)}
      </Text>
    </Card>
    </Link>
  );
}
