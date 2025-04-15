import React, { useState } from 'react';
import { Button, message } from 'antd';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ResourceCard from '../components/ResourceCard';
import ResourceSlot from '../components/ResourceSlot';
import { ResourceType } from '../types/GameTypes';
import './WarriorSynthesis.css';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
`;

const Sidebar = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #8b0000;
`;

const MainArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const SlotsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
`;

const ResourceCardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: rgba(26, 26, 26, 0.8);
  border-radius: 8px;
  border: 1px solid #8b0000;
  width: 100%;
`;

const SynthesisButton = styled(Button)`
  background: #8b0000;
  border-color: #ffd700;
  color: #ffd700;
  font-size: 16px;
  padding: 0 30px;
  height: 40px;
  
  &:hover {
    background: #a00000;
    border-color: #ffd700;
    color: #ffd700;
  }
`;

// Define image paths
const resourceImages: Record<string, string> = {
  金: '/img/金.webp',
  木: '/img/木.webp',
  水: '/img/水.webp',
  火: '/img/火.webp',
  土: '/img/土.webp',
  生命: '/img/生命.webp',
  能量: '/img/能量.webp',
};

const warriorImages: Record<string, string> = {
  金兵: '/img/金兵.webp',
  木兵: '/img/木兵.webp',
  水兵: '/img/水兵.webp',
  火兵: '/img/火兵.webp',
  土兵: '/img/土兵.webp',
};

// Add styling for images in sidebars
const SidebarListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const SidebarImage = styled.img`
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
`;

const SidebarTextContainer = styled.div``;

// Helper function to get ResourceType from name
const getResourceTypeFromName = (name: string): ResourceType | undefined => {
  switch (name) {
    case '金': return ResourceType.ECONOMY;
    case '木': return ResourceType.WOOD;
    case '水': return ResourceType.WATER;
    case '火': return ResourceType.FIRE;
    case '土': return ResourceType.EARTH;
    case '生命': return ResourceType.LIFE;
    case '能量': return ResourceType.ENERGY;
    default: return undefined;
  }
};

// Define synthesis rules outside the component function
const synthesisRules = [
    { inputs: [ResourceType.ECONOMY, ResourceType.WOOD, ResourceType.FIRE], output: '金兵', cost: { '金': 5, '木': 1, '火': 1 } },
    { inputs: [ResourceType.WOOD, ResourceType.WATER, ResourceType.EARTH], output: '木兵', cost: { '木': 5, '水': 1, '土': 1 } },
    { inputs: [ResourceType.WATER, ResourceType.ECONOMY, ResourceType.WOOD], output: '水兵', cost: { '水': 5, '金': 1, '木': 1 } },
    { inputs: [ResourceType.FIRE, ResourceType.WATER, ResourceType.EARTH], output: '火兵', cost: { '火': 5, '水': 1, '土': 1 } },
    { inputs: [ResourceType.EARTH, ResourceType.ECONOMY, ResourceType.FIRE], output: '土兵', cost: { '土': 5, '金': 1, '火': 1 } },
];
// Define a type for the rule structure
type SynthesisRule = typeof synthesisRules[0];

const WarriorSynthesis: React.FC = () => {
  const navigate = useNavigate();
  const { resources, warriors, updateResources, updateWarriors } = useStore();
  const [selectedSlots, setSelectedSlots] = useState<({ type: ResourceType; imageUrl?: string } | undefined)[]>(Array(3).fill(undefined));

  const resourceTypeToName: Record<ResourceType, string> = {
      [ResourceType.ECONOMY]: '金',
      [ResourceType.WOOD]: '木',
      [ResourceType.WATER]: '水',
      [ResourceType.FIRE]: '火',
      [ResourceType.EARTH]: '土',
      [ResourceType.LIFE]: '生命',
      [ResourceType.ENERGY]: '能量',
  };

  const handleResourceDrop = (index: number, resourceType: ResourceType, imageUrl?: string) => {
      const resourceName = resourceTypeToName[resourceType];
      if (resourceName && resources[resourceName] <= 0) {
          message.warning('该资源数量为 0，无法放置');
          return;
      }
      if (selectedSlots.some((slot, i) => i !== index && slot?.type === resourceType)) {
          message.warning('该资源已在其他槽位');
          return;
      }
      setSelectedSlots(prev => {
          const newSlots = [...prev];
          newSlots[index] = { type: resourceType, imageUrl };
          return newSlots;
      });
  };

  const handleClearSlot = (index: number) => {
      setSelectedSlots(prev => {
          const newSlots = [...prev];
          newSlots[index] = undefined;
          return newSlots;
      });
  };

  const handleSynthesis = () => {
    const filledSlots = selectedSlots.map(slot => slot?.type).filter(type => type !== undefined) as ResourceType[];
    if (filledSlots.length !== 3) {
      message.error('请填满所有三个资源槽位');
      return;
    }

    const selectedSet = new Set(filledSlots);
    // Access synthesisRules defined outside
    const matchedRule = synthesisRules.find(rule =>
        rule.inputs.length === selectedSet.size &&
        rule.inputs.every(input => selectedSet.has(input))
    );

    if (!matchedRule) {
      message.error('无效的资源组合');
      return;
    }

    const hasEnoughResources = Object.entries(matchedRule.cost).every(([resourceName, amount]) =>
        resources[resourceName] >= amount
    );

    if (!hasEnoughResources) {
      message.error(`资源不足，无法合成 ${matchedRule.output}`);
      return;
    }

    Object.entries(matchedRule.cost).forEach(([resourceName, amount]) => {
        updateResources(resourceName, -amount);
    });

    updateWarriors(matchedRule.output, 1);
    message.success(`成功合成 ${matchedRule.output}！`);

    setSelectedSlots(Array(3).fill(undefined));
  };

  return (
    <PageContainer>
      <Header>
        <Title>战士合成</Title>
        <Button type="primary" onClick={() => navigate('/game')}>
          返回采集
        </Button>
      </Header>

      <Content>
        <Sidebar>
          <h2>合成配方</h2>
          <ul>
            {/* Access synthesisRules defined outside */}
            {synthesisRules.map((rule: SynthesisRule) => ( // Added type annotation for rule
                <SidebarListItem key={rule.output}>
                    <SidebarImage src={warriorImages[rule.output]} alt={rule.output} />
                    <SidebarTextContainer>
                        <h3>{rule.output}</h3>
                        <span>{Object.entries(rule.cost).map(([res, amount]) => `${res}: ${amount}`).join(', ')}</span>
                    </SidebarTextContainer>
                </SidebarListItem>
            ))}
          </ul>
        </Sidebar>

        <MainArea>
          <SlotsContainer>
            {selectedSlots.map((slot, index) => (
              <ResourceSlot
                key={index}
                resourceType={slot?.type}
                imageUrl={slot?.imageUrl}
                onDrop={(type, imgUrl) => handleResourceDrop(index, type, imgUrl)}
                onClick={() => handleClearSlot(index)}
                index={index}
              />
            ))}
          </SlotsContainer>

          <SynthesisButton onClick={handleSynthesis} disabled={selectedSlots.some(slot => slot === undefined)}>
            合成
          </SynthesisButton>

          <ResourceCardsContainer>
            {Object.entries(resources)
             .map(([name, count]) => ({ name, count, type: getResourceTypeFromName(name), imageUrl: resourceImages[name] }))
             .filter(item => item.type !== undefined)
             .map(({ name, count, type, imageUrl }) => (
              <ResourceCard
                key={name}
                resourceType={type!}
                count={count}
                isDisabled={count <= 0 || selectedSlots.some(slot => slot?.type === type)}
                imageUrl={imageUrl}
                onClick={() => {
                  if (count > 0 && !selectedSlots.some(slot => slot?.type === type)) {
                      const emptySlotIndex = selectedSlots.findIndex(slot => !slot);
                      if (emptySlotIndex !== -1) {
                          handleResourceDrop(emptySlotIndex, type!, imageUrl);
                      } else {
                          message.warning('所有槽位已满');
                      }
                  } else if (count <= 0) {
                      message.warning('该资源数量为 0');
                  } else {
                      message.warning('该资源已放置在槽位中');
                  }
                }}
              />
            ))}
          </ResourceCardsContainer>
        </MainArea>

        <Sidebar>
          <h2>战士库存</h2>
           <ul>
            {Object.entries(warriors).map(([type, count]) => (
              <SidebarListItem key={type}>
                 {/* Check if image exists before rendering */}
                {warriorImages[type] && <SidebarImage src={warriorImages[type]} alt={type} />}
                 <SidebarTextContainer>
                    <h3>{type}</h3>
                    <p>数量: {count}</p>
                 </SidebarTextContainer>
              </SidebarListItem>
            ))}
          </ul>
        </Sidebar>
      </Content>
    </PageContainer>
  );
};

export default WarriorSynthesis; 